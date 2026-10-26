package com.mmm.makros.service;

import com.mmm.makros.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SummaryService {

    private final GoalService goalService;
    private final MealService mealService;

    public DaySummaryDto getDaySummary(Long userId, LocalDate date) {
        DailyGoalDto goal = goalService.getGoal(userId, date);
        List<MealDto> meals = mealService.getMealsForDate(userId, date);
        return buildDaySummary(date, goal, meals);
    }

    public WeekSummaryDto getWeekSummary(Long userId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<DailyGoalDto> goals = goalService.getWeekGoals(userId, weekStart);
        List<MealDto> meals = mealService.getMealsForRange(userId, weekStart, weekEnd);

        Map<LocalDate, List<MealDto>> mealsByDate = meals.stream()
                .collect(Collectors.groupingBy(MealDto::date));

        Map<LocalDate, DailyGoalDto> goalsByDate = goals.stream()
                .collect(Collectors.toMap(DailyGoalDto::date, Function.identity()));

        List<DaySummaryDto> days = weekStart.datesUntil(weekEnd.plusDays(1))
                .map(date -> buildDaySummary(date, goalsByDate.get(date), mealsByDate.getOrDefault(date, List.of())))
                .toList();

        MacroTotals weekGoalTotal = days.stream().map(DaySummaryDto::goal).reduce(MacroTotals.zero(), MacroTotals::plus);
        MacroTotals weekConsumedTotal = days.stream().map(DaySummaryDto::consumed).reduce(MacroTotals.zero(), MacroTotals::plus);
        int weekVeggiesGoalTotal = days.stream().mapToInt(DaySummaryDto::veggiesGoalG).sum();
        BigDecimal weekVeggiesConsumedTotal = days.stream()
                .map(DaySummaryDto::veggiesConsumedG)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new WeekSummaryDto(weekStart, weekEnd, days, weekGoalTotal, weekConsumedTotal, weekVeggiesGoalTotal, weekVeggiesConsumedTotal);
    }

    private DaySummaryDto buildDaySummary(LocalDate date, DailyGoalDto goal, List<MealDto> meals) {
        MacroTotals consumed = meals.stream().map(MealDto::macroTotals).reduce(MacroTotals.zero(), MacroTotals::plus);
        BigDecimal veggiesConsumed = meals.stream().map(MealDto::veggiesG).reduce(BigDecimal.ZERO, BigDecimal::add);
        MacroTotals remaining = goal.goal().minus(consumed);
        BigDecimal veggiesRemaining = BigDecimal.valueOf(goal.veggiesGoalG()).subtract(veggiesConsumed);

        return new DaySummaryDto(date, goal.goal(), consumed, remaining, goal.veggiesGoalG(), veggiesConsumed, veggiesRemaining, meals);
    }
}
