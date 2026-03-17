package com.llmrouting.agent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntentResult {
    private String intent; // "coding", "research", "summarization", "general", "real-time"
    private String complexity; // "low", "medium", "high"
    private boolean requiresRealTime;
    private double confidenceScore; // 0.0 to 1.0
}
