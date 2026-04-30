package com.sportconnect.performance.controller;

import com.sportconnect.performance.dto.PerformanceRequest;
import com.sportconnect.performance.dto.PerformanceStatsResponse;
import com.sportconnect.performance.entity.Performance;
import com.sportconnect.performance.service.PerformanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/performances")
public class PerformanceController {

    private final PerformanceService service;

    public PerformanceController(PerformanceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Performance> add(@Valid @RequestBody PerformanceRequest request) {
        Performance saved = service.addPerformance(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Performance>> getForUser(@PathVariable String userId,
                                                       @RequestParam(required = false) String sport) {
        List<Performance> list = service.getUserPerformances(userId, sport);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<PerformanceStatsResponse> stats(@PathVariable String userId) {
        PerformanceStatsResponse stats = service.getStats(userId);
        return ResponseEntity.ok(stats);
    }
}
