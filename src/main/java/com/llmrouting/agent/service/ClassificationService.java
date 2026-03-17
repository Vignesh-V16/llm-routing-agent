package com.llmrouting.agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassificationService {

    private final LlmProvider llmProvider;
    private final ObjectMapper objectMapper;

    @Value("${routing.classification.prompt-template}")
    private String promptTemplate;

    public IntentResult classify(String query) {
        String prompt = String.format(promptTemplate, query.replace("\"", "\\\""));
        
        String jsonResponse = llmProvider.executePrompt(prompt, ExpertModel.GEMINI);
        
        try {
            // Strip markdown block if present (e.g., ```json ... ```)
            String cleanJson = jsonResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            
            // Strict parsing checking structure
            JsonNode rootNode = objectMapper.readTree(cleanJson);
            
            String intent = rootNode.path("intent").asText("general");
            String complexity = rootNode.path("complexity").asText("medium");
            boolean requiresRealTime = rootNode.path("requiresRealTime").asBoolean(false);
            double confidenceScore = rootNode.path("confidenceScore").asDouble(0.5);

            // Normalize confidence score to 0.0 - 1.0 range
            confidenceScore = Math.max(0.0, Math.min(1.0, confidenceScore));

            // Fallback for very low confidence
            if (confidenceScore < 0.3) {
                log.warn("Low confidence classification ({}). Falling back to general/medium.", confidenceScore);
                intent = "general";
                complexity = "medium";
            }

            IntentResult result = IntentResult.builder()
                .intent(intent)
                .complexity(complexity)
                .requiresRealTime(requiresRealTime)
                .confidenceScore(confidenceScore)
                .build();

            log.info("Query classified: [{}] -> Intent: {}, Complexity: {}, Confidence: {}", 
                     query, result.getIntent(), result.getComplexity(), result.getConfidenceScore());
            
            return result;

        } catch (Exception e) {
            log.error("Failed to parse LLM classification response completely. Raw: {}", jsonResponse, e);
            return IntentResult.builder()
                .intent("general")
                .complexity("high") // Default to high complexity to route to a smarter model when in doubt
                .requiresRealTime(false)
                .confidenceScore(0.1)
                .build();
        }
    }
}
