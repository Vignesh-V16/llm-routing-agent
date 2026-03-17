package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.HistoricalQuery;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository repository;
    private final EmbeddingService embeddingService;

    public void storeQuery(String query, IntentResult intentResult, ExpertModel modelUsed, double successScore, String synthesizedResponse) {
        double[] embedding = embeddingService.generateEmbedding(query);
        
        HistoricalQuery historical = HistoricalQuery.builder()
            .originalQuery(query)
            .classifiedIntent(intentResult.getIntent())
            .classifiedComplexity(intentResult.getComplexity())
            .modelUsed(modelUsed)
            .successScore(Math.max(0.0, Math.min(1.0, successScore)))
            .queryEmbedding(embedding)
            .cachedResponse(synthesizedResponse)
            .build();
            
        repository.save(historical);
        log.info("Stored/Updated historical query: Model={}, Intent={}, SuccessScore={}, CachedAnswerLength={}", 
            modelUsed, intentResult.getIntent(), historical.getSuccessScore(), 
            synthesizedResponse != null ? synthesizedResponse.length() : 0);
    }

    public double calculateMemoryBoost(String currentQuery, IntentResult currentIntent, ExpertModel model) {
        List<HistoricalQuery> history = repository.findByIntentAndModel(currentIntent.getIntent(), model);

        if (history.isEmpty()) return 0.5;

        double[] currentEmbedding = embeddingService.generateEmbedding(currentQuery);

        double totalWeightedScore = 0.0;
        double totalWeight = 0.0;
        Instant now = Instant.now();

        for (HistoricalQuery hq : history) {
            // Apply Semantic Cosine Similarity natively
            double cosineSimilarity = computeCosineSimilarity(currentEmbedding, hq.getQueryEmbedding());
            if (cosineSimilarity < 0.60) {
                continue; // Ignore irrelevant historical data completely
            }

            // Decay: Lose 50% weight every 7 days
            long daysOld = Duration.between(hq.getTimestamp(), now).toDays();
            double timeDecayWeight = Math.pow(0.5, daysOld / 7.0); 

            double finalWeight = cosineSimilarity * timeDecayWeight;

            totalWeightedScore += (hq.getSuccessScore() * finalWeight);
            totalWeight += finalWeight;
        }

        double boost = totalWeight > 0 ? totalWeightedScore / totalWeight : 0.5;
        log.debug("Calculated semantic memory boost for {} on {} -> {}", model, currentIntent.getIntent(), boost);
        return boost;
    }

    private double computeCosineSimilarity(double[] vecA, double[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length) return 0.0;
        
        double dotProduct = 0.0;
        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
        }
        // Since we normalized dimensions = 1.0 in EmbeddingService, Dot Product EQUALS Cosine Similarity!
        return Math.max(0.0, dotProduct);
    }
}
