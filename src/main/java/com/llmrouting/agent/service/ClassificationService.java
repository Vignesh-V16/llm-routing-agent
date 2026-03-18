package com.llmrouting.agent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.FauxRoutingResult;
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

    public FauxRoutingResult classify(String query) {
        String prompt = String.format(promptTemplate, query.replace("\"", "\\\""));
        String jsonResponse = null;
        
        try {
            jsonResponse = llmProvider.executePrompt(prompt, ExpertModel.CLAUDE);
        } catch (Exception e) {
            log.warn("Classification primary failure (Claude): {}. Falling back to Groq...", e.getMessage());
            try {
                jsonResponse = llmProvider.executePrompt(prompt, ExpertModel.GROQ);
                log.info("Classification successfully resolved using Fallback engine.");
            } catch (Exception ex) {
                log.error("Both primary (Claude) and fallback (Groq) classification providers failed.", ex);
            }
        }

        if (jsonResponse == null) {
            log.warn("Classification pipeline completely failed! Emitting safe default routing payload.");
            return FauxRoutingResult.builder()
                .chosenExpert("gemini")
                .backendModel("groq")
                .finalPromptToBackend("You are a general AI expert. Answer clearly.\nUser query: " + query)
                .reason("Fallback system default applied due to classification failure.")
                .build();
        }

        try {
            // Strip markdown block if present (e.g., ```json ... ```)
            String cleanJson = jsonResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            
            // Strict parsing checking structure
            JsonNode rootNode = objectMapper.readTree(cleanJson);
            
            String chosenExpert = rootNode.path("chosen_expert").asText("gemini");
            String backendModel = rootNode.path("backend_model").asText("groq");
            String finalPromptToBackend = rootNode.path("final_prompt_to_backend").asText("You are an AI assistant. User query: " + query);
            String reason = rootNode.path("reason").asText("Routed inherently based on generic logic.");

            FauxRoutingResult result = FauxRoutingResult.builder()
                .chosenExpert(chosenExpert)
                .backendModel(backendModel)
                .finalPromptToBackend(finalPromptToBackend)
                .reason(reason)
                .build();

            log.info("Query successfully Faux-Classified: [{}] -> Simulated Expert: {}, Execution Target: {}, Reason: {}", 
                     query, result.getChosenExpert(), result.getBackendModel(), result.getReason());
            
            return result;

        } catch (Exception e) {
            log.error("Failed to execute or parse LLM Faux-Classification completely. Reverting to safe schema.", e);
            return FauxRoutingResult.builder()
                .chosenExpert("gemini")
                .backendModel("groq")
                .finalPromptToBackend("You are a general AI expert. Answer clearly.\nUser query: " + query)
                .reason("Fallback system default.")
                .build();
        }
    }
}
