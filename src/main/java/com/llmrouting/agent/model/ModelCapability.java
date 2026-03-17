package com.llmrouting.agent.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ModelCapability {
    private ExpertModel model;
    private List<String> supportedIntents;
    private String maxComplexity; // "low", "medium", "high"
    private long baseLatencyMs;
    private double costPerRequest;
}
