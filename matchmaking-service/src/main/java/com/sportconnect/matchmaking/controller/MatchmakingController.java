package com.sportconnect.matchmaking.controller;

import com.sportconnect.matchmaking.dto.UserProfileDto;
import com.sportconnect.matchmaking.service.MatchmakingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/matchmaking")
public class MatchmakingController {

    private final MatchmakingService service;

    public MatchmakingController(MatchmakingService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDto>> search(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(service.search(sport, level, location));
    }

    @GetMapping("/recommend/{userId}")
    public ResponseEntity<List<UserProfileDto>> recommend(@PathVariable Long userId) {
        return ResponseEntity.ok(service.recommend(userId));
    }

    @GetMapping("/nearby/{userId}")
    public ResponseEntity<List<UserProfileDto>> nearby(@PathVariable Long userId) {
        return ResponseEntity.ok(service.nearby(userId));
    }
}
