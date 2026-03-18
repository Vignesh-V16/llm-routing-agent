package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.ExpertResponse;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SynthesizerService {

    private final LlmProvider llmProvider;

    private static final String SYNTHESIS_PROMPT_TEMPLATE = 
        "You are an expert answer synthesizer.\n" +
        "You have received answers from %d different AI experts regarding the following query.\n\n" +
        "Query: \"%s\"\n\n" +
        "Expert Answers:\n" +
        "%s\n\n" +
        "Synthesize these answers into a single, cohesive, and comprehensive response. " +
        "Resolve any contradictions logically and highlight the most important points. " +
        "Note the Model Sources mentally when deciding which to trust (e.g., trust ChatGPT for code, Claude for real-time fact checks).";

    public String synthesize(String originalQuery, List<ExpertResponse> rawAnswers) {
        if (rawAnswers == null || rawAnswers.isEmpty()) {
            return "Routing failed. No experts successfully handled the query.";
        }
        
        if (rawAnswers.size() == 1) {
            log.debug("Only one answer provided by {}; skipping synthesis layer.", rawAnswers.get(0).getModel());
            return rawAnswers.get(0).getResponseText();
        }

        StringBuilder combinedAnswers = new StringBuilder();
        for (ExpertResponse answer : rawAnswers) {
            combinedAnswers.append("--- Output from ").append(answer.getModel()).append(" ---\n");
            combinedAnswers.append(answer.getResponseText()).append("\n\n");
        }

        String prompt = String.format(SYNTHESIS_PROMPT_TEMPLATE, 
            rawAnswers.size(), originalQuery, combinedAnswers.toString());

        log.info("Synthesizing {} distinct expert answers into a unified response.", rawAnswers.size());
        
        // Use a highly capable reasoning model for synthesis
        return llmProvider.executePrompt(prompt, ExpertModel.OPENAI);
    }
}
