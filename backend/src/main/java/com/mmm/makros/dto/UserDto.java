package com.mmm.makros.dto;

import java.time.Instant;

public record UserDto(Long id, String username, Integer veggieGoalG, Instant createdAt) {
}
