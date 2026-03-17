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
 * REST adapter for the Perplexity AI Sonar Online Chat API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PerplexityClient implements LlmProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${routing.api.perplexity.url}")
    private String apiUrl;

    @Value("${routing.api.perplexity.key}")
    private String apiKey;

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.PERPLEXITY) {
            throw new IllegalArgumentException("PerplexityClient cannot execute prompt for model: " + model);
        }

        try {
            log.debug("Routing query to Perplexity AI API...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "sonar-small-online"); // Specialized indexing online model for realtime info
            
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            requestBody.put("messages", Collections.singletonList(message));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            String response = restTemplate.postForObject(apiUrl, request, String.class);
            
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            return content.trim();

        } catch (Exception e) {
            log.error("Failed to execute prompt against Perplexity", e);
            throw new RuntimeException("Perplexity execution failed", e);
        }
    }
}
