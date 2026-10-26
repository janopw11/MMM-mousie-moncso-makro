package com.mmm.makros.controller;

import com.mmm.makros.dto.DailyGoalDto;
import com.mmm.makros.dto.UpdateDailyGoalRequest;
import com.mmm.makros.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping("/{date}")
    public DailyGoalDto getGoal(@PathVariable Long userId,
                                 @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return goalService.getGoal(userId, date);
    }

    @GetMapping
    public List<DailyGoalDto> getWeekGoals(@PathVariable Long userId,
                                            @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return goalService.getWeekGoals(userId, weekStart);
    }

    @PutMapping("/{date}")
    public DailyGoalDto upsertGoal(@PathVariable Long userId,
                                    @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                    @Valid @RequestBody UpdateDailyGoalRequest request) {
        return goalService.upsertGoal(userId, date, request);
    }
}
