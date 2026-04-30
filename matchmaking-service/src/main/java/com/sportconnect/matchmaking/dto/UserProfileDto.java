package com.sportconnect.matchmaking.dto;

public class UserProfileDto {
    private Long id;
    private String name;
    private String sport;
    private String level;
    private String location;

    public UserProfileDto() {
    }

    public UserProfileDto(Long id, String name, String sport, String level, String location) {
        this.id = id;
        this.name = name;
        this.sport = sport;
        this.level = level;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
