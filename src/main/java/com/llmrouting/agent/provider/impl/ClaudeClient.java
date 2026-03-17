package com.llmrouting.agent.provider.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * REST adapter for the Anthropic Claude Messages API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ClaudeClient implements LlmProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${routing.api.claude.url}")
    private String apiUrl;

    @Value("${routing.api.claude.key}")
    private String apiKey;

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.CLAUDE) {
            throw new IllegalArgumentException("ClaudeClient cannot execute prompt for model: " + model);
        }

        try {
            log.debug("Routing query to Anthropic Claude API...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "claude-3-opus-20240229"); // Standardizing on Opus for robust reasoning
            requestBody.put("max_tokens", 1024);
            
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            requestBody.put("messages", Collections.singletonList(message));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            String response = restTemplate.postForObject(apiUrl, request, String.class);
            
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode.path("content").get(0).path("text").asText();
            
            return content.trim();

        } catch (Exception e) {
            log.error("Failed to execute prompt against Claude", e);
            throw new RuntimeException("Claude execution failed", e);
        }
    }
}
