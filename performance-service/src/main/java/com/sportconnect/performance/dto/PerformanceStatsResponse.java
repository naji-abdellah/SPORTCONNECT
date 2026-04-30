package com.sportconnect.performance.dto;

public class PerformanceStatsResponse {
    private long totalSessions;
    private double totalCalories;
    private long totalDuration;
    private double averageCalories;
    private double averageDuration;

    public PerformanceStatsResponse() {
    }

    public PerformanceStatsResponse(long totalSessions, double totalCalories, long totalDuration, double averageCalories, double averageDuration) {
        this.totalSessions = totalSessions;
        this.totalCalories = totalCalories;
        this.totalDuration = totalDuration;
        this.averageCalories = averageCalories;
        this.averageDuration = averageDuration;
    }

    public long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public double getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(double totalCalories) {
        this.totalCalories = totalCalories;
    }

    public long getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(long totalDuration) {
        this.totalDuration = totalDuration;
    }

    public double getAverageCalories() {
        return averageCalories;
    }

    public void setAverageCalories(double averageCalories) {
        this.averageCalories = averageCalories;
    }

    public double getAverageDuration() {
        return averageDuration;
    }

    public void setAverageDuration(double averageDuration) {
        this.averageDuration = averageDuration;
    }
}
