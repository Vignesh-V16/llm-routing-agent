package com.llmrouting.agent.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QueryRequest {
    @NotBlank(message = "Query cannot be blank")
    private String query;
}
