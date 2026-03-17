package com.llmrouting.agent.service;

import com.llmrouting.agent.model.HistoricalQuery;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.model.QueryResponse;
import com.llmrouting.agent.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final MemoryRepository repository;
    private final EmbeddingService embeddingService;

    @Value("${routing.cache.similarity-threshold:0.95}")
    private double cacheSimilarityThreshold;

    public Optional<QueryResponse> checkCache(String currentQuery, IntentResult classification) {
        List<HistoricalQuery> history = repository.findByIntentAndModel(
                classification.getIntent(), 
                null // Pull all models under this intent to scan for semantic caching
        );
        
        // Re-use repository memory if no distinct intent matches found
        if (history.isEmpty()) {
            return Optional.empty();
        }

        double[] currentEmbedding = embeddingService.generateEmbedding(currentQuery);
        
        HistoricalQuery bestMatch = null;
        double maxSimilarity = 0.0;

        for (HistoricalQuery hq : history) {
            if (hq.getCachedResponse() == null) continue; // Ensure there's actually an answer to retrieve

            double similarity = computeCosineSimilarity(currentEmbedding, hq.getQueryEmbedding());
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = hq;
            }
        }

        if (maxSimilarity >= cacheSimilarityThreshold && bestMatch != null && bestMatch.getSuccessScore() > 0.5) {
            log.info("Semantic Cache HIT! Cosine Similarity: {} -> Bypassing LLM execution entirely.", maxSimilarity);
            return Optional.of(QueryResponse.builder()
                .answer(bestMatch.getCachedResponse())
                .modelUsed(bestMatch.getModelUsed()) // Maintain attribution to original LLM
                .latencyMs(5) // Artificial ultra-fast cache latency
                .cost(0.0) // Completely free retrieval mathematically
                .confidenceScore(1.0) // Perfect confidence via direct identical match
                .build());
        }

        log.debug("No valid semantic Cache Match. Max Similarity: {}", maxSimilarity);
        return Optional.empty();
    }

    private double computeCosineSimilarity(double[] vecA, double[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length) return 0.0;
        
        double dotProduct = 0.0;
        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
        }
        return Math.max(0.0, Math.min(1.0, dotProduct));
    }
}
