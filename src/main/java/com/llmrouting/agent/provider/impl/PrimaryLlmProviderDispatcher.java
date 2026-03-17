package com.llmrouting.agent.provider.impl;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Primary LlmProvider acting as a dedicated internal Router/Dispatcher mechanism.
 * This guarantees Spring Context doesn't crash from 'expected single bean but found 5' anomalies
 * while strictly upholding the original clean generic Architecture interfaces.
 */
@Primary
@Component
@RequiredArgsConstructor
public class PrimaryLlmProviderDispatcher implements LlmProvider {

    private final OpenAIClient openAIClient;
    private final GeminiClient geminiClient;
    private final ClaudeClient claudeClient;
    private final PerplexityClient perplexityClient;
    private final HuggingFaceClient huggingFaceClient;

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        return switch (model) {
            case CHATGPT -> openAIClient.executePrompt(prompt, model);
            case GEMINI -> geminiClient.executePrompt(prompt, model);
            case CLAUDE -> claudeClient.executePrompt(prompt, model);
            case PERPLEXITY -> perplexityClient.executePrompt(prompt, model);
            case HUGGINGFACE -> huggingFaceClient.executePrompt(prompt, model);
        };
    }
}
