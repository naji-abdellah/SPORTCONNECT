package com.sportconnect.performance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class PerformanceRequest {

    @NotNull
    private String userId;

    @NotBlank
    private String sport;

    @NotNull
    @Positive
    private Double calories;

    @NotNull
    @Positive
    private Integer duration;

    @NotNull
    private LocalDate date;

    public PerformanceRequest() {
    }

    public PerformanceRequest(String userId, String sport, Double calories, Integer duration, LocalDate date) {
        this.userId = userId;
        this.sport = sport;
        this.calories = calories;
        this.duration = duration;
        this.date = date;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public Double getCalories() {
        return calories;
    }

    public void setCalories(Double calories) {
        this.calories = calories;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

}
