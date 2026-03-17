package com.llmrouting.agent.controller;

import com.llmrouting.agent.model.FeedbackRequest;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.model.QueryRequest;
import com.llmrouting.agent.model.QueryResponse;
import com.llmrouting.agent.service.MemoryService;
import com.llmrouting.agent.service.RouterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/router")
@RequiredArgsConstructor
public class RouterController {

    private final RouterService routerService;
    private final MemoryService memoryService;
    private static final String REQUEST_ID_KEY = "requestId";

    @PostMapping("/query")
    public ResponseEntity<QueryResponse> routeQuery(@Valid @RequestBody QueryRequest request) {
        String requestId = UUID.randomUUID().toString();
        MDC.put(REQUEST_ID_KEY, requestId);
        try {
            log.info("Received new routing query.");
            QueryResponse response = routerService.processQuery(request);
            return ResponseEntity.ok(response);
        } finally {
            MDC.remove(REQUEST_ID_KEY);
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<String> receiveFeedback(@Valid @RequestBody FeedbackRequest feedbackRequest) {
        String requestId = UUID.randomUUID().toString();
        MDC.put(REQUEST_ID_KEY, requestId);
        
        try {
            log.info("Received external feedback for query. Model: {}, Intent {}, Score: {}", 
                feedbackRequest.getModelUsed(), feedbackRequest.getIntentUsed(), feedbackRequest.getSuccessScore());

            IntentResult rebuiltIntent = IntentResult.builder()
                .intent(feedbackRequest.getIntentUsed())
                .complexity("medium") // Assume average for inbound metric mapping
                .build();

            memoryService.storeQuery(
                feedbackRequest.getQuery(), 
                rebuiltIntent, 
                feedbackRequest.getModelUsed(), 
                feedbackRequest.getSuccessScore(),
                "N/A - Externally evaluated feedback"
            );

            return ResponseEntity.ok("Feedback registered into MemoryService.");
        } finally {
            MDC.remove(REQUEST_ID_KEY);
        }
    }
}
