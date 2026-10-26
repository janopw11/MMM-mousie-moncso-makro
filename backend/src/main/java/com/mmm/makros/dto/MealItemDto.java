package com.mmm.makros.dto;

import com.mmm.makros.entity.MealItemType;

import java.math.BigDecimal;

public record MealItemDto(
        Long id,
        MealItemType itemType,
        String name,
        BigDecimal grams,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG,
        BigDecimal calories
) {
}
