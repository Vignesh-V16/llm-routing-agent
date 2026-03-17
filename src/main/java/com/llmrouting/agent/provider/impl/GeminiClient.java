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
 * REST adapter for the Google Gemini GenerateContent API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient implements LlmProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${routing.api.gemini.url}")
    private String apiUrl;

    @Value("${routing.api.gemini.key}")
    private String apiKey;

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.GEMINI) {
            throw new IllegalArgumentException("GeminiClient cannot execute prompt for model: " + model);
        }

        try {
            log.debug("Routing query to Gemini API...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));
            
            requestBody.put("contents", Collections.singletonList(content));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Some environments require API Key interpolation via query params, but header is more resilient if supported.
            String targetUrl = apiUrl + "?key=" + apiKey;

            String response = restTemplate.postForObject(targetUrl, request, String.class);
            
            JsonNode rootNode = objectMapper.readTree(response);
            String responseText = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            return responseText.trim();

        } catch (Exception e) {
            log.error("Failed to execute prompt against Gemini", e);
            throw new RuntimeException("Gemini execution failed", e);
        }
    }
}
