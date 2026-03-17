package com.llmrouting.agent.provider.impl;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * An isolated integration stub for the Hugging Face HTTP Inference API.
 */
@Slf4j
@Component
public class HuggingFaceClient implements LlmProvider {

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.HUGGINGFACE) {
            throw new IllegalArgumentException("HuggingFaceClient cannot execute prompt for model: " + model);
        }

        log.debug("Routing low-complexity prompt to Hugging Face Inference API.");
        
        // Simulating rapid REST call to api-inference.huggingface.co
        return "This is a direct, low-cost fallback response generated natively by HuggingFace.";
    }
}
