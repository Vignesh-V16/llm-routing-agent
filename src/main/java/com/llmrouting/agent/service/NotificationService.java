package com.llmrouting.agent.service;

import com.llmrouting.agent.model.WebhookPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    @Value("${routing.integration.webhook-url}")
    private String webhookUrl;

    // Using a REST template instance; in a real app this is typically an injected bean.
    private final RestTemplate restTemplate = new RestTemplate();

    @Async("routingThreadPool")
    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    public void sendWebhookNotification(WebhookPayload payload) {
        if (webhookUrl == null || webhookUrl.isEmpty() || webhookUrl.contains("disabled")) {
            log.debug("Webhook notifications are disabled. Skipping webhook payload: {}", payload.getRequestId());
            return;
        }

        log.info("Firing telemetry webhook to '{}' for requestId: {}", webhookUrl, payload.getRequestId());
        restTemplate.postForEntity(webhookUrl, payload, String.class);
    }
    
    @Recover
    public void recoverWebhookFailure(Exception e, WebhookPayload payload) {
        log.error("Exhausted all retry attempts for firing webhook. Payload data dropped for requestId: {}. Reason: {}", 
            payload.getRequestId(), e.getMessage());
    }
}
