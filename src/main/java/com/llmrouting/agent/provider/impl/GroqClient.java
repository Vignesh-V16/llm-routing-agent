package com.llmrouting.agent.provider.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.provider.LlmProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class GroqClient implements LlmProvider {

    private final ObjectMapper objectMapper;

    @Value("${routing.api.groq.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqUrl;

    @Value("${routing.api.groq.key:}")
    private String groqApiKey;

    public GroqClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String executePrompt(String prompt, ExpertModel model) {
        if (model != ExpertModel.GROQ) {
            throw new IllegalArgumentException("GroqClient cannot execute prompt for model: " + model);
        }

        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            throw new IllegalStateException("GROQ API Key is missing or unconfigured.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", "llama-3.1-70b-versatile"); // Blazing fast production model

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode userMessage = objectMapper.createObjectNode();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            
            long startTime = System.currentTimeMillis();
            log.info("[GROQ] Dispatching prompt to Groq Llama3 cluster. Query length: {}", prompt.length());
            
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);
            factory.setReadTimeout(15000); // 15s timeout
            RestTemplate timeoutTemplate = new RestTemplate(factory);

            ResponseEntity<String> response = timeoutTemplate.postForEntity(groqUrl, entity, String.class);
            
            log.info("[GROQ] HTTP 200 OK. Llama3 generation executed in {} ms", (System.currentTimeMillis() - startTime));

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode messageNode = choices.get(0).path("message");
                return messageNode.path("content").asText();
            }

            log.warn("[GROQ] Llama3 structure extraction failure: {}", response.getBody());
            throw new RuntimeException("Groq Llama3 failed to yield content structural arrays.");
            
        } catch (RestClientException e) {
            log.error("[GROQ] API Dispatch Exception: {}", e.getMessage());
            throw new RuntimeException("Groq API disconnected: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("[GROQ] JSON parsing failure: {}", e.getMessage());
            throw new RuntimeException("Groq Execution fault: " + e.getMessage(), e);
        }
    }
}
