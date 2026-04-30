package com.sportconnect.performance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "performances")
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String sport;

    @Column(nullable = false)
    private Double calories;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private LocalDate date;

    public Performance() {
    }

    public Performance(Long id, String userId, String sport, Double calories, Integer duration, LocalDate date) {
        this.id = id;
        this.userId = userId;
        this.sport = sport;
        this.calories = calories;
        this.duration = duration;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
