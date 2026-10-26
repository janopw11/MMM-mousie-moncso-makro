package com.mmm.makros.controller;

import com.mmm.makros.dto.CreateGoalPresetRequest;
import com.mmm.makros.dto.GoalPresetDto;
import com.mmm.makros.service.GoalPresetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/goal-presets")
@RequiredArgsConstructor
public class GoalPresetController {

    private final GoalPresetService presetService;

    @GetMapping
    public List<GoalPresetDto> list(@PathVariable Long userId) {
        return presetService.list(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GoalPresetDto create(@PathVariable Long userId, @Valid @RequestBody CreateGoalPresetRequest request) {
        return presetService.create(userId, request);
    }

    @DeleteMapping("/{presetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long userId, @PathVariable Long presetId) {
        presetService.delete(userId, presetId);
    }
}
