package com.llmrouting.agent.repository.impl;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.HistoricalQuery;
import com.llmrouting.agent.repository.MemoryRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryRepositoryImpl implements MemoryRepository {

    // K: Hash, V: HistoricalQuery (for deduplication)
    private final Map<Integer, HistoricalQuery> memoryMap = new ConcurrentHashMap<>();

    @Override
    public void save(HistoricalQuery query) {
        memoryMap.put(query.getQueryHash(), query);
    }

    @Override
    public List<HistoricalQuery> findByIntentAndModel(String intent, ExpertModel model) {
        return memoryMap.values().stream()
                .filter(hq -> hq.getModelUsed() == model)
                .filter(hq -> hq.getClassifiedIntent().equals(intent))
                .collect(Collectors.toList());
    }
}
