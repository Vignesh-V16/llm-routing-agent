package com.llmrouting.agent.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {
    
    @NotBlank
    private String query;
    
    @NotBlank
    private String intentUsed;
    
    @NotNull
    private ExpertModel modelUsed;
    
    @Min(0)
    @Max(1)
    private double successScore;
}
