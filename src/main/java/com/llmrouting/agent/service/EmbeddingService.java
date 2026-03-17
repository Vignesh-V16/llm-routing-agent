package com.llmrouting.agent.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Simulates a Hugging Face Sentence Transformers Inference API.
 * In Phase D, we use deterministic mathematical transformations to convert text 
 * into normalized vector arrays for Cosine Similarity modeling without incurring 
 * heavy local GPU costs or extreme latency.
 */
@Service
public class EmbeddingService {

    private static final int DIMENSIONS = 128;

    /**
     * Translates a natural language query into a mathematical double[] embedding.
     */
    public double[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            return new double[DIMENSIONS];
        }

        double[] vector = new double[DIMENSIONS];
        byte[] bytes = text.toLowerCase().getBytes(StandardCharsets.UTF_8);
        
        // Deterministic hashing across dimensions
        for (int i = 0; i < bytes.length; i++) {
            vector[i % DIMENSIONS] += bytes[i];
        }
        
        // Normalize the vector (Magnitude = 1.0)
        double magnitude = 0;
        for (double v : vector) {
            magnitude += v * v;
        }
        magnitude = Math.sqrt(magnitude);
        
        if (magnitude > 0) {
            for (int i = 0; i < DIMENSIONS; i++) {
                vector[i] /= magnitude;
            }
        }
        
        return vector;
    }
}
