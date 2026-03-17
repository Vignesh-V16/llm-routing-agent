package com.llmrouting.agent.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QueryResponse {
    private String answer;
    private ExpertModel modelUsed;
    private long latencyMs;
    private double cost;
    private double confidenceScore;
}
