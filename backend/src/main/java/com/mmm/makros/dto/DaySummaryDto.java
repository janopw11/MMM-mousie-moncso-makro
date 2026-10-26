package com.mmm.makros.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DaySummaryDto(
        LocalDate date,
        MacroTotals goal,
        MacroTotals consumed,
        MacroTotals remaining,
        Integer veggiesGoalG,
        BigDecimal veggiesConsumedG,
        BigDecimal veggiesRemainingG,
        List<MealDto> meals
) {
}
