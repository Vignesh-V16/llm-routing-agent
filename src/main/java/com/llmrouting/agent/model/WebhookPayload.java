package com.llmrouting.agent.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WebhookPayload {
    private String requestId;
    private String query;
    private String intentAssigned;
    private String primaryModelSelected;
    private double confidenceScore;
    private long totalLatencyMs;
    private String synthesizedResponse;
}
