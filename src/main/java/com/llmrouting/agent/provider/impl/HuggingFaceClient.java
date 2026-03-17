package com.llmrouting.agent.provider.impl;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * An isolated integration stub for the Hugging Face HTTP Inference API.
 */
@Slf4j
@Component
@Profile("prod")
public class HuggingFaceClient implements LlmProvider {

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        log.debug("Routing low-complexity prompt to Hugging Face Inference API. Requested model: {}", model);
        
        // Simulating rapid REST call to api-inference.huggingface.co
        return "{\"intent\": \"general\", \"complexity\": \"low\", \"requiresRealTime\": false, \"confidenceScore\": 0.95}";
    }
}
