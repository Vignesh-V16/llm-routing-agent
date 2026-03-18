package com.llmrouting.agent.provider.impl;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * A mock implementation for Phase 2 development.
 * Simulates an LLM returning structured JSON based on keywords in the prompt.
 */
@Component
@Profile("dev")
public class MockLlmProvider implements LlmProvider {

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model == ExpertModel.GROQ) {
            return "Speed generating fallback response from mock GROQ.";
        }
        
        String lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.contains("objective ai evaluator")) {
            return "0.85";
        }

        // Very basic mock behavior for classification prompts based on keywords
        if (lowerPrompt.contains("code") || lowerPrompt.contains("java") || lowerPrompt.contains("python")) {
            return "{\"intent\": \"coding\", \"complexity\": \"high\", \"requiresRealTime\": false, \"confidenceScore\": 0.95}";
        } else if (lowerPrompt.contains("summarize") || lowerPrompt.contains("tl;dr")) {
            return "{\"intent\": \"summarization\", \"complexity\": \"low\", \"requiresRealTime\": false, \"confidenceScore\": 0.90}";
        } else if (lowerPrompt.contains("latest") || lowerPrompt.contains("news") || lowerPrompt.contains("weather")) {
            return "{\"intent\": \"real-time\", \"complexity\": \"medium\", \"requiresRealTime\": true, \"confidenceScore\": 0.98}";
        } else if (lowerPrompt.contains("research") || lowerPrompt.contains("paper") || lowerPrompt.contains("history")) {
            return "{\"intent\": \"research\", \"complexity\": \"high\", \"requiresRealTime\": false, \"confidenceScore\": 0.88}";
        }

        // Default fallback response
        return "{\"intent\": \"general\", \"complexity\": \"medium\", \"requiresRealTime\": false, \"confidenceScore\": 0.70}";
    }
}
