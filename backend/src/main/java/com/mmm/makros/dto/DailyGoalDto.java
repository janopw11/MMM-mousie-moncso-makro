package com.mmm.makros.dto;

import java.time.LocalDate;

public record DailyGoalDto(LocalDate date, MacroTotals goal, Integer veggiesGoalG) {
}
