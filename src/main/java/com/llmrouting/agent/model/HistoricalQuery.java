package com.llmrouting.agent.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Objects;

@Data
@Builder
public class HistoricalQuery {
    private String originalQuery;
    private String classifiedIntent;
    private String classifiedComplexity;
    private ExpertModel modelUsed;
    private double successScore; // 0.0 to 1.0
    private double[] queryEmbedding;
    private String cachedResponse;
    
    @Builder.Default
    private Instant timestamp = Instant.now();

    public int getQueryHash() {
        return Objects.hash(originalQuery, classifiedIntent, modelUsed);
    }
}
