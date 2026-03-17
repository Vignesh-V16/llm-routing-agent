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
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * REST adapter for the OpenAI Chat Completions API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAIClient implements LlmProvider {

    private final ObjectMapper objectMapper;

    @Value("${routing.api.openai.url}")
    private String apiUrl;

    @Value("${routing.api.openai.key}")
    private String apiKey;

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.CHATGPT) {
            throw new IllegalArgumentException("OpenAIClient cannot execute prompt for model: " + model);
        }

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("unconfigured")) {
            throw new IllegalStateException("OPENAI_API_KEY is missing or unconfigured. Aborting execution safely.");
        }

        try {
            log.debug("Routing query to OpenAI API...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo"); // Reverting to universally accessible model
            
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            requestBody.put("messages", Collections.singletonList(message));
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            // Instantiate native timeout boundaries for this external HTTP connection to prevent Thread blocking
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(15000); // OpenAI reasoning may take slightly longer
            RestTemplate timeoutTemplate = new RestTemplate(factory);

            String response = timeoutTemplate.postForObject(apiUrl, request, String.class);
            
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            return content.trim();

        } catch (Exception e) {
            log.error("Failed to execute prompt against OpenAI: {}", e.getMessage());
            throw new IllegalStateException("OpenAI execution failed: " + e.getMessage(), e);
        }
    }
}
