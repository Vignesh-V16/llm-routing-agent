package com.llmrouting.agent.repository;

import com.llmrouting.agent.model.ExpertModel;
import com.llmrouting.agent.model.HistoricalQuery;

import java.util.List;

public interface MemoryRepository {
    void save(HistoricalQuery query);
    List<HistoricalQuery> findByIntentAndModel(String intent, ExpertModel model);
}
