package com.sportconnect.performance.service;

import com.sportconnect.performance.dto.PerformanceRequest;
import com.sportconnect.performance.dto.PerformanceStatsResponse;
import com.sportconnect.performance.entity.Performance;
import com.sportconnect.performance.repository.PerformanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerformanceServiceImpl implements PerformanceService {

    private final PerformanceRepository repository;

    public PerformanceServiceImpl(PerformanceRepository repository) {
        this.repository = repository;
    }

    @Override
    public Performance addPerformance(PerformanceRequest request) {
        Performance p = new Performance();
        p.setUserId(request.getUserId());
        p.setSport(request.getSport());
        p.setCalories(request.getCalories());
        p.setDuration(request.getDuration());
        p.setDate(request.getDate());
        return repository.save(p);
    }

    @Override
    public List<Performance> getUserPerformances(String userId, String sport) {
        if (StringUtils.hasText(sport)) {
            return repository.findByUserIdAndSportIgnoreCase(userId, sport);
        }
        return repository.findByUserId(userId);
    }

    @Override
    public PerformanceStatsResponse getStats(String userId) {
        List<Performance> list = repository.findByUserId(userId);
        long totalSessions = list.size();
        double totalCalories = list.stream().mapToDouble(p -> p.getCalories() == null ? 0.0 : p.getCalories()).sum();
        long totalDuration = list.stream().mapToLong(p -> p.getDuration() == null ? 0L : p.getDuration()).sum();
        double averageCalories = totalSessions > 0 ? totalCalories / totalSessions : 0.0;
        double averageDuration = totalSessions > 0 ? (double) totalDuration / totalSessions : 0.0;

        return new PerformanceStatsResponse(totalSessions, totalCalories, totalDuration, averageCalories, averageDuration);
    }
}
