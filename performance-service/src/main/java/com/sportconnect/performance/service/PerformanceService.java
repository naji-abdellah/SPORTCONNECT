package com.sportconnect.performance.service;

import com.sportconnect.performance.dto.PerformanceRequest;
import com.sportconnect.performance.dto.PerformanceStatsResponse;
import com.sportconnect.performance.entity.Performance;

import java.util.List;

public interface PerformanceService {
    Performance addPerformance(PerformanceRequest request);

    List<Performance> getUserPerformances(String userId, String sport);

    PerformanceStatsResponse getStats(String userId);
}
