package com.mmm.makros.dto;

import com.mmm.makros.entity.MealItemType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record MealItemRequest(
        @NotNull MealItemType itemType,
        @NotBlank String name,
        @NotNull @DecimalMin(value = "0", inclusive = false, message = "Grams must be positive") BigDecimal grams,
        @DecimalMin(value = "0", message = "Protein cannot be negative") BigDecimal proteinG,
        @DecimalMin(value = "0", message = "Carbs cannot be negative") BigDecimal carbsG,
        @DecimalMin(value = "0", message = "Fat cannot be negative") BigDecimal fatG
) {
}
