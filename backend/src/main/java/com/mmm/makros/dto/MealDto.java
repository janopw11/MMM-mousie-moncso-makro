package com.mmm.makros.dto;

import com.mmm.makros.entity.MealType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record MealDto(
        Long id,
        LocalDate date,
        String name,
        MealType type,
        List<MealItemDto> items,
        MacroTotals macroTotals,
        java.math.BigDecimal veggiesG,
        Instant createdAt
) {
}
