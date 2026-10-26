package com.mmm.makros.dto;

import java.time.LocalDate;
import java.util.List;

public record WeekSummaryDto(
        LocalDate weekStart,
        LocalDate weekEnd,
        List<DaySummaryDto> days,
        MacroTotals weekGoalTotal,
        MacroTotals weekConsumedTotal,
        Integer weekVeggiesGoalTotalG,
        java.math.BigDecimal weekVeggiesConsumedTotalG
) {
}
