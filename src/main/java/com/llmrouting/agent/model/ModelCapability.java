package com.llmrouting.agent.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ModelCapability {
    private ExpertModel model;
    private List<String> strengths;
    private String costLevel; // low, medium, high
    private int latencyScore; // e.g., 1 (slow) to 10 (fast)
    private String maxComplexity; // low, medium, high
}
