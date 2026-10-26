package com.mmm.makros.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateGoalPresetRequest(
        @NotBlank @Size(max = 64, message = "Name is too long") String name,
        @NotNull @DecimalMin(value = "0", message = "Protein cannot be negative") BigDecimal proteinG,
        @NotNull @DecimalMin(value = "0", message = "Carbs cannot be negative") BigDecimal carbsG,
        @NotNull @DecimalMin(value = "0", message = "Fat cannot be negative") BigDecimal fatG,
        @Min(value = 0, message = "Veggie goal cannot be negative") Integer veggiesGoalG
) {
}
