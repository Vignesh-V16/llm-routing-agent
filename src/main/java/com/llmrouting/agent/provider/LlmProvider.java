package com.llmrouting.agent.provider;

import com.llmrouting.agent.model.ExpertModel;

public interface LlmProvider {
    /**
     * Executes a given prompt against the specified LLM expert.
     *
     * @param prompt The complete prompt to send.
     * @param model  The target model to route the execution to.
     * @return The raw text response from the LLM.
     */
    String executePrompt(String prompt, ExpertModel model);
}
