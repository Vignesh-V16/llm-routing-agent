package com.llmrouting.agent.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExpertResponse {
    private ExpertModel model;
    private String responseText;
}
