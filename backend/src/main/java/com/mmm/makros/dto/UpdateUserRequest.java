package com.mmm.makros.dto;

import jakarta.validation.constraints.Min;

public record UpdateUserRequest(
        @Min(value = 0, message = "Veggie goal cannot be negative") Integer veggieGoalG
) {
}
