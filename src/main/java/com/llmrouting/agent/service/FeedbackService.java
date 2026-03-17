package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.IntentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final MemoryService memoryService;
    private final EvaluatorService evaluatorService;

    @Async
    public void evaluateAndStore(String originalQuery, IntentResult intent, ExpertModel modelUsed, String finalResponse) {
        try {
            log.debug("Evaluating response quality for query: {}", originalQuery);
            double evaluatedScore = evaluatorService.evaluateResponse(originalQuery, intent, finalResponse);

            memoryService.storeQuery(originalQuery, intent, modelUsed, evaluatedScore, finalResponse);
        } catch (Exception e) {
            log.error("Async Feedback evaluation failed. Isolation preserved. Query: {}, Model: {}", originalQuery, modelUsed, e);
        }
    }
}
