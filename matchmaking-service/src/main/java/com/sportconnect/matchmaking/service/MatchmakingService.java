package com.sportconnect.matchmaking.service;

import com.sportconnect.matchmaking.dto.UserProfileDto;

import java.util.List;

public interface MatchmakingService {
    List<UserProfileDto> search(String sport, String level, String location);

    List<UserProfileDto> recommend(Long userId);

    List<UserProfileDto> nearby(Long userId);
}
