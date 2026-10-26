package com.mmm.makros.service;

import com.mmm.makros.dto.DailyGoalDto;
import com.mmm.makros.dto.MacroTotals;
import com.mmm.makros.dto.UpdateDailyGoalRequest;
import com.mmm.makros.entity.DailyGoal;
import com.mmm.makros.entity.User;
import com.mmm.makros.repository.DailyGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final DailyGoalRepository goalRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public DailyGoalDto getGoal(Long userId, LocalDate date) {
        User user = userService.findEntity(userId);
        return goalRepository.findByUserIdAndGoalDate(userId, date)
                .map(this::toDto)
                .orElseGet(() -> defaultGoal(date, user));
    }

    @Transactional(readOnly = true)
    public List<DailyGoalDto> getWeekGoals(Long userId, LocalDate weekStart) {
        User user = userService.findEntity(userId);
        LocalDate weekEnd = weekStart.plusDays(6);
        Map<LocalDate, DailyGoal> existing = goalRepository
                .findByUserIdAndGoalDateBetweenOrderByGoalDateAsc(userId, weekStart, weekEnd)
                .stream()
                .collect(Collectors.toMap(DailyGoal::getGoalDate, Function.identity()));

        return weekStart.datesUntil(weekEnd.plusDays(1))
                .map(date -> existing.containsKey(date) ? toDto(existing.get(date)) : defaultGoal(date, user))
                .toList();
    }

    public DailyGoalDto upsertGoal(Long userId, LocalDate date, UpdateDailyGoalRequest request) {
        User user = userService.findEntity(userId);
        DailyGoal goal = goalRepository.findByUserIdAndGoalDate(userId, date)
                .orElseGet(() -> DailyGoal.builder().user(user).goalDate(date).build());
        goal.setProteinG(request.proteinG());
        goal.setCarbsG(request.carbsG());
        goal.setFatG(request.fatG());
        goal.setVeggiesGoalG(request.veggiesGoalG() != null ? request.veggiesGoalG() : user.getVeggieGoalG());
        return toDto(goalRepository.save(goal));
    }

    private DailyGoalDto defaultGoal(LocalDate date, User user) {
        return new DailyGoalDto(date, MacroTotals.zero(), user.getVeggieGoalG());
    }

    private DailyGoalDto toDto(DailyGoal goal) {
        MacroTotals totals = MacroTotals.of(goal.getProteinG(), goal.getCarbsG(), goal.getFatG());
        return new DailyGoalDto(goal.getGoalDate(), totals, goal.getVeggiesGoalG());
    }
}
