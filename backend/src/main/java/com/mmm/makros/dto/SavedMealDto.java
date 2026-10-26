package com.mmm.makros.dto;

import com.mmm.makros.entity.MealType;

import java.math.BigDecimal;
import java.util.List;

public record SavedMealDto(
        Long id,
        String name,
        MealType type,
        List<MealItemDto> items,
        MacroTotals macroTotals,
        BigDecimal veggiesG
) {
}
