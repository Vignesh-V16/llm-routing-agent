package com.llmrouting.agent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FauxRoutingResult {
    private String chosenExpert;
    private String backendModel;
    private String finalPromptToBackend;
    private String reason;
    
    // Extracted native ExpertModel mapping corresponding strictly to the fake UI label requested by the LLM
    public ExpertModel getSimulatedModel() {
        if (chosenExpert == null) return ExpertModel.GEMINI;
        return switch (chosenExpert.toLowerCase().trim()) {
            case "chatgpt" -> ExpertModel.OPENAI;
            case "claude" -> ExpertModel.CLAUDE;
            case "perplexity" -> ExpertModel.GEMINI; // Perplexity decoupled in Phase F; defaulting to Gemini for General Knowledge visually
            default -> ExpertModel.GEMINI;
        };
    }
}
