package com.sportconnect.performance.repository;

import com.sportconnect.performance.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByUserId(String userId);

    List<Performance> findByUserIdAndSportIgnoreCase(String userId, String sport);
}
