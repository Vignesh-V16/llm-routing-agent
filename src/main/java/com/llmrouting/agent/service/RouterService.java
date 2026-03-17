package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.ExpertResponse;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.model.QueryRequest;
import com.llmrouting.agent.model.QueryResponse;
import com.llmrouting.agent.model.WebhookPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouterService {

    private final ClassificationService classificationService;
    private final ScoringService scoringService;
    private final FeedbackService feedbackService;
    private final SynthesizerService synthesizerService;
    private final ResilientLlmExecutionService resilientLlmProvider;
    private final NotificationService notificationService;
    private final CacheService cacheService;

    @Value("${routing.scoring.threshold.minimum:0.5}")
    private double minimumScoreThreshold;

    @Value("${routing.async.timeout-seconds:5}")
    private long asyncTimeoutSeconds;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("routingThreadPool")
    private java.util.concurrent.Executor taskExecutor;

    public QueryResponse processQuery(QueryRequest request) {
        long startTime = System.currentTimeMillis();
        String requestId = org.slf4j.MDC.get("requestId");

        // 1. Classify
        IntentResult classification = classifyQuery(request.getQuery());
        
        // 1.5 Semantic Response Caching (Bypass everything if Cosine Similarity > 0.95)
        var cachedResponse = cacheService.checkCache(request.getQuery(), classification);
        if (cachedResponse.isPresent()) {
            return cachedResponse.get();
        }
        
        // 2. Score
        Map<ExpertModel, Double> scores = scoreModels(request.getQuery(), classification);
        
        // 3. Select 
        List<ExpertModel> selectedModels = selectBestModel(scores, classification);
        
        // 4. Execute (Parallel asynchronous evaluation)
        List<ExpertResponse> responses = executeQuery(request.getQuery(), selectedModels, scores);

        // Global Fallback Handler: if all models failed.
        if (responses.isEmpty()) {
            log.error("Global Fallback triggered. All expert models failed to execute.");
            responses.add(new ExpertResponse(ExpertModel.GEMINI, "I apologize, but all AI experts are currently unreachable. Please try again later."));
        }
        
        // 5. Synthesize
        QueryResponse finalResponse = synthesizeResponse(
            responses, 
            classification.getConfidenceScore(), 
            System.currentTimeMillis() - startTime
        );

        // 6. Feedback & Telemetry
        ExpertModel primaryModelUsed = finalResponse.getModelUsed();
        feedbackService.evaluateAndStore(request.getQuery(), classification, primaryModelUsed, finalResponse.getAnswer());

        WebhookPayload webhookData = WebhookPayload.builder()
            .requestId(requestId)
            .query(request.getQuery())
            .intentAssigned(classification.getIntent())
            .primaryModelSelected(primaryModelUsed.name())
            .confidenceScore(classification.getConfidenceScore())
            .totalLatencyMs(finalResponse.getLatencyMs())
            .synthesizedResponse(finalResponse.getAnswer())
            .build();
        notificationService.sendWebhookNotification(webhookData);

        return finalResponse;
    }

    private IntentResult classifyQuery(String query) {
        return classificationService.classify(query);
    }

    private Map<ExpertModel, Double> scoreModels(String rawQuery, IntentResult classification) {
        return scoringService.scoreModels(rawQuery, classification);
    }

    private List<ExpertModel> selectBestModel(Map<ExpertModel, Double> scores, IntentResult classification) {
        List<ExpertModel> sortedModels = scores.entrySet().stream()
                .sorted(Map.Entry.<ExpertModel, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        ExpertModel topModel = sortedModels.get(0);
        double topScore = scores.getOrDefault(topModel, 0.0);

        if (topScore < minimumScoreThreshold) {
            log.warn("Top model '{}' scored {} which is below threshold {}. Escalating to CHATGPT fallback.", 
                topModel, topScore, minimumScoreThreshold);
            return Collections.singletonList(ExpertModel.CHATGPT); 
        }

        if ("high".equalsIgnoreCase(classification.getComplexity()) && sortedModels.size() > 1) {
            log.info("High complexity detected. Selecting top 2 MoE models: {}, {}", sortedModels.get(0), sortedModels.get(1));
            return List.of(sortedModels.get(0), sortedModels.get(1));
        }

        log.info("Selected Top Model: {} with score: {}", topModel, topScore);
        return Collections.singletonList(topModel);
    }

    private List<ExpertResponse> executeQuery(String query, List<ExpertModel> initialModels, Map<ExpertModel, Double> scores) {
        List<CompletableFuture<ExpertResponse>> futures = initialModels.stream()
            .map(model -> executeWithFallback(query, model, initialModels, scores))
            .collect(Collectors.toList());

        // Wait for all to complete and collect valid results
        return futures.stream()
            .map(CompletableFuture::join)
            .filter(res -> res != null)
            .collect(Collectors.toList());
    }

    private CompletableFuture<ExpertResponse> executeWithFallback(String query, ExpertModel targetModel, List<ExpertModel> alreadyTried, Map<ExpertModel, Double> scores) {
        return CompletableFuture.supplyAsync(() -> {
            log.debug("Executing query on model: {}", targetModel);
            String rawText = resilientLlmProvider.execute(query, targetModel);
            return new ExpertResponse(targetModel, rawText);
        }, taskExecutor)
        .orTimeout(asyncTimeoutSeconds, TimeUnit.SECONDS)
        .exceptionally(ex -> {
            log.error("Execution failed for model {}: {}", targetModel, ex.getMessage());
            
            ExpertModel nextBest = scores.entrySet().stream()
                .filter(e -> !alreadyTried.contains(e.getKey()))
                .sorted(Map.Entry.<ExpertModel, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
                
            if (nextBest != null && scores.get(nextBest) >= minimumScoreThreshold) {
                log.warn("Falling back from {} to next best model {}", targetModel, nextBest);
                java.util.List<ExpertModel> newTried = new java.util.ArrayList<>(alreadyTried);
                newTried.add(nextBest);
                return executeWithFallback(query, nextBest, newTried, scores).join();
            }
            
            return null; // Exhausted fallbacks
        });
    }

    private QueryResponse synthesizeResponse(List<ExpertResponse> responses, double confidence, long totalLatency) {
        String finalAnswer = synthesizerService.synthesize("Original Query Hidden in Log", responses);
        
        return QueryResponse.builder()
                .answer(finalAnswer)
                .modelUsed(responses.isEmpty() ? ExpertModel.GEMINI : responses.get(0).getModel()) 
                .latencyMs(totalLatency)
                .cost(responses.size() * 0.01) 
                .confidenceScore(confidence)
                .build();
    }
}
