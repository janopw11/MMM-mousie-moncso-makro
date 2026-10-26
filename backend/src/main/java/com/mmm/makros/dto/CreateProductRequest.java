package com.mmm.makros.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Macro values are expressed per 100g of the product.
 */
public record CreateProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull @DecimalMin(value = "0", message = "Protein cannot be negative") BigDecimal proteinG,
        @NotNull @DecimalMin(value = "0", message = "Carbs cannot be negative") BigDecimal carbsG,
        @NotNull @DecimalMin(value = "0", message = "Fat cannot be negative") BigDecimal fatG
) {
}
