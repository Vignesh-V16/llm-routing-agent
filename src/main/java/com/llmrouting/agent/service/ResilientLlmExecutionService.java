package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResilientLlmExecutionService {

    private final LlmProvider llmProvider;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final RetryRegistry retryRegistry;

    /**
     * Executes the requested LLM dynamically wrapping it in Model-specific Circuit Breaker and Retry instances.
     */
    public String execute(String prompt, ExpertModel model) {
        String instanceName = model.name();
        
        io.github.resilience4j.circuitbreaker.CircuitBreaker circuitBreaker = 
                circuitBreakerRegistry.circuitBreaker(instanceName);
        io.github.resilience4j.retry.Retry retry = 
                retryRegistry.retry(instanceName);

        Supplier<String> decoratedSupplier = io.github.resilience4j.circuitbreaker.CircuitBreaker
                .decorateSupplier(circuitBreaker, () -> llmProvider.executePrompt(prompt, model));
        
        decoratedSupplier = io.github.resilience4j.retry.Retry
                .decorateSupplier(retry, decoratedSupplier);

        return decoratedSupplier.get();
    }
}
