package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.IntentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluatorService {

    private final ResilientLlmExecutionService resilientLlmProvider;

    private static final String EVALUATION_PROMPT = 
        "You are an objective AI evaluator.\n" +
        "Rate the following AI response on a scale from 0.0 to 1.0 based on how well it answers the Original Query and matches the Intent.\n" +
        "Output ONLY the floating-point number, nothing else.\n\n" +
        "Original Query: \"%s\"\n" +
        "Intent: %s\n\n" +
        "AI Response: \"%s\"\n";

    public double evaluateResponse(String originalQuery, IntentResult intent, String finalResponse) {
        String prompt = String.format(EVALUATION_PROMPT, originalQuery, intent.getIntent(), finalResponse);
        
        try {
            log.debug("Dispatching LLM evaluator for query: {}", originalQuery);
            
            // Using a resilient call backed by Resilience4j. Utilizing a capable reasoning model natively.
            String resultText = resilientLlmProvider.execute(prompt, ExpertModel.CHATGPT);
            
            // Parse strictly to float
            double score = Double.parseDouble(resultText.trim());
            double confinedScore = Math.max(0.0, Math.min(1.0, score));
            
            log.info("LLM Evaluation Score: {}", confinedScore);
            return confinedScore;
            
        } catch (NumberFormatException e) {
            log.warn("Evaluator LLM returned a non-numeric response. Defaulting score to 0.5. Raw response: {}", e.getMessage());
            return 0.5;
        } catch (Exception e) {
            log.error("Evaluator LLM execution failed. Defaulting to 0.5.", e);
            return 0.5;
        }
    }
}
