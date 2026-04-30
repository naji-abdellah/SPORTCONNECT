package com.sportconnect.matchmaking.service;

import com.sportconnect.matchmaking.dto.UserProfileDto;
import com.sportconnect.matchmaking.entity.UserProfile;
import com.sportconnect.matchmaking.exception.UserNotFoundException;
import com.sportconnect.matchmaking.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MatchmakingServiceImpl implements MatchmakingService {

    private final UserProfileRepository repository;

    public MatchmakingServiceImpl(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<UserProfileDto> search(String sport, String level, String location) {
        return repository.findAll().stream()
                .filter(u -> sport == null || sport.isEmpty() || Objects.equals(u.getSport(), sport))
                .filter(u -> level == null || level.isEmpty() || Objects.equals(u.getLevel(), level))
                .filter(u -> location == null || location.isEmpty() || Objects.equals(u.getLocation(), location))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserProfileDto> recommend(Long userId) {
        UserProfile base = repository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        return repository.findAll().stream()
                .filter(u -> !u.getId().equals(userId))
                .map(u -> new Scored(u, score(base, u)))
                .sorted(Comparator.comparingInt(Scored::getScore).reversed())
                .limit(5)
                .map(s -> toDto(s.user))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserProfileDto> nearby(Long userId) {
        UserProfile base = repository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        return repository.findByLocation(base.getLocation()).stream()
                .filter(u -> !u.getId().equals(userId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private int score(UserProfile base, UserProfile other) {
        int s = 0;
        if (Objects.equals(base.getSport(), other.getSport())) s += 3;
        if (Objects.equals(base.getLevel(), other.getLevel())) s += 2;
        if (Objects.equals(base.getLocation(), other.getLocation())) s += 1;
        return s;
    }

    private UserProfileDto toDto(UserProfile u) {
        return new UserProfileDto(u.getId(), u.getName(), u.getSport(), u.getLevel(), u.getLocation());
    }

    private static class Scored {
        final UserProfile user;
        final int score;

        Scored(UserProfile user, int score) {
            this.user = user;
            this.score = score;
        }

        int getScore() {
            return score;
        }
    }
}
