package com.mmm.makros.controller;

import com.mmm.makros.dto.CreateMealRequest;
import com.mmm.makros.dto.MealDto;
import com.mmm.makros.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public List<MealDto> getMeals(@PathVariable Long userId,
                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (date != null) {
            return mealService.getMealsForDate(userId, date);
        }
        if (from != null && to != null) {
            return mealService.getMealsForRange(userId, from, to);
        }
        throw new IllegalArgumentException("Either 'date' or both 'from' and 'to' query params are required");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealDto createMeal(@PathVariable Long userId, @Valid @RequestBody CreateMealRequest request) {
        return mealService.createMeal(userId, request);
    }

    @PutMapping("/{mealId}")
    public MealDto updateMeal(@PathVariable Long userId, @PathVariable Long mealId,
                               @Valid @RequestBody CreateMealRequest request) {
        return mealService.updateMeal(userId, mealId, request);
    }

    @DeleteMapping("/{mealId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long userId, @PathVariable Long mealId) {
        mealService.deleteMeal(userId, mealId);
    }
}
