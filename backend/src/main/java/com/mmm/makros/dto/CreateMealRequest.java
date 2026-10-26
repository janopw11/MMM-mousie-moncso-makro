package com.mmm.makros.dto;

import com.mmm.makros.entity.MealType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateMealRequest(
        @NotNull LocalDate date,
        @NotBlank @jakarta.validation.constraints.Size(max = 120) String name,
        @NotNull MealType type,
        @NotEmpty(message = "A meal needs at least one ingredient or vegetable") @Valid List<MealItemRequest> items
) {
}
