package com.llmrouting.agent.service;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.IntentResult;
import com.llmrouting.agent.model.ModelCapability;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringService {

    private final MemoryService memoryService;

    @Value("${routing.scoring.weight.intent:0.4}")
    private double intentWeight;

    @Value("${routing.scoring.weight.complexity:0.3}")
    private double complexityWeight;

    @Value("${routing.scoring.weight.latency:0.1}")
    private double latencyWeight;

    @Value("${routing.scoring.weights.cost.base:0.15}")
    private double baseCostWeight;

    @Value("${routing.scoring.weights.cost.multiplier.low-complexity:2.5}")
    private double lowComplexityCostMultiplier;

    @Value("${routing.scoring.weights.cost.multiplier.high-confidence:1.5}")
    private double highConfidenceCostMultiplier;

    @Value("${routing.scoring.weight.memory:0.1}")
    private double memoryWeight;

    @Value("${routing.scoring.penalty.non-realtime:0.1}")
    private double nonRealTimePenalty;

    private Map<ExpertModel, ModelCapability> capabilities;

    @PostConstruct
    public void init() {
        capabilities = new EnumMap<>(ExpertModel.class);
        
        capabilities.put(ExpertModel.CHATGPT, ModelCapability.builder()
            .model(ExpertModel.CHATGPT)
            .strengths(List.of("coding", "reasoning", "explanation"))
            .maxComplexity("high")
            .latencyScore(6) // somewhat slow due to reasoning depth
            .costLevel("high")
            .build());

        capabilities.put(ExpertModel.CLAUDE, ModelCapability.builder()
            .model(ExpertModel.CLAUDE)
            .strengths(List.of("reasoning", "summarization", "explanation"))
            .maxComplexity("high")
            .latencyScore(5)
            .costLevel("high")
            .build());

        capabilities.put(ExpertModel.GEMINI, ModelCapability.builder()
            .model(ExpertModel.GEMINI)
            .strengths(List.of("general", "explanation"))
            .maxComplexity("medium")
            .latencyScore(8)
            .costLevel("medium")
            .build());

        capabilities.put(ExpertModel.PERPLEXITY, ModelCapability.builder()
            .model(ExpertModel.PERPLEXITY)
            .strengths(List.of("realtime", "search", "general"))
            .maxComplexity("medium")
            .latencyScore(7)
            .costLevel("medium")
            .build());
            
        capabilities.put(ExpertModel.HUGGINGFACE, ModelCapability.builder()
            .model(ExpertModel.HUGGINGFACE)
            .strengths(List.of("simple", "general"))
            .maxComplexity("low")
            .latencyScore(10) // fastest
            .costLevel("low")
            .build());
    }

    public Map<ExpertModel, Double> scoreModels(String rawQuery, IntentResult classification) {
        return capabilities.values().stream()
            .collect(Collectors.toMap(
                ModelCapability::getModel,
                cap -> calculateScore(rawQuery, cap, classification)
            ));
    }

    private double calculateScore(String rawQuery, ModelCapability cap, IntentResult classification) {
        // 1. Intent Match (0 to 1) -> Map classification.getIntent() against cap.getStrengths()
        double intentScore = cap.getStrengths().contains(classification.getIntent().toLowerCase()) ? 1.0 : 0.0;
        
        // 2. Complexity Fit (0 to 1)
        double complexityScore = calculateComplexityFit(cap.getMaxComplexity(), classification.getComplexity());

        // 3. Latency Score (0 to 1, derived from 1-10 scale)
        double latencyScore = cap.getLatencyScore() / 10.0;

        // 4. Cost Score (0 to 1) - Low cost gets higher score
        double costScore = 0.5;
        if ("low".equalsIgnoreCase(cap.getCostLevel())) costScore = 1.0;
        else if ("high".equalsIgnoreCase(cap.getCostLevel())) costScore = 0.2;

        // 5. Memory Boost (0 to 1, 0.5 is neutral)
        double memoryScore = memoryService.calculateMemoryBoost(rawQuery, classification, cap.getModel());

        // Calculate dynamic cost weight based on query complexity and classification confidence
        double dynamicCostWeight = baseCostWeight;
        if ("low".equalsIgnoreCase(classification.getComplexity())) {
            dynamicCostWeight *= lowComplexityCostMultiplier;
            log.debug("Low complexity detected. Applying cost multiplier. New cost weight: {}", dynamicCostWeight);
        }
        if (classification.getConfidenceScore() > 0.90) {
            dynamicCostWeight *= highConfidenceCostMultiplier;
            log.debug("High classification confidence detected. Applying cost multiplier. New cost weight: {}", dynamicCostWeight);
        }

        // Re-normalize core execution weights (intent, complexity, latency, dynamic cost)
        double totalCoreWeight = intentWeight + complexityWeight + latencyWeight + dynamicCostWeight;
        double normIntentWeight = intentWeight / totalCoreWeight;
        double normComplexityWeight = complexityWeight / totalCoreWeight;
        double normLatencyWeight = latencyWeight / totalCoreWeight;
        double normCostWeight = dynamicCostWeight / totalCoreWeight;

        // Calculate weighted total base score
        double baseScore = (intentScore * normIntentWeight) + 
                           (complexityScore * normComplexityWeight) + 
                           (latencyScore * normLatencyWeight) + 
                           (costScore * normCostWeight) +
                           (memoryScore * memoryWeight);  // Memory remains a fixed conceptual ceiling boost

        // Confine the math strictly
        baseScore = Math.max(0.0, Math.min(1.0, baseScore));

        // Crucial Override: If requires real-time, drastically penalize others
        if (classification.isRequiresRealTime() && cap.getModel() != ExpertModel.PERPLEXITY) {
            baseScore *= nonRealTimePenalty;
        }

        // Confidence impact: lower confidence scales down the entire score
        double finalScore = baseScore * classification.getConfidenceScore();

        // Final normalization catch-all
        finalScore = Math.max(0.0, Math.min(1.0, finalScore));

        log.debug("Model: [{}]. FinalScore: {}. BreakDown-> B:{}, Intent:{}, Comp:{}, Lat:{}, Cost:{}, Mem:{}, Conf:{}",
            cap.getModel(), finalScore, baseScore, intentScore, complexityScore, latencyScore, costScore, memoryScore, classification.getConfidenceScore());

        return finalScore;
    }

    private double calculateComplexityFit(String modelMaxComplexity, String queryComplexity) {
        int modelLevel = complexityLevel(modelMaxComplexity);
        int queryLevel = complexityLevel(queryComplexity);
        
        if (modelLevel >= queryLevel) {
             return 1.0; 
        } else {
             return 0.2; // Severely penalize underpowered models directly via math
        }
    }

    private int complexityLevel(String c) {
        if (c == null) return 1;
        switch(c.toLowerCase()) {
            case "low": return 1;
            case "medium": return 2;
            case "high": return 3;
            default: return 1;
        }
    }
}
