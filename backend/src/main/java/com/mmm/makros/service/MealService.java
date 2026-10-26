package com.mmm.makros.service;

import com.mmm.makros.dto.*;
import com.mmm.makros.entity.*;
import com.mmm.makros.exception.NotFoundException;
import com.mmm.makros.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MealService {

    private final MealRepository mealRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<MealDto> getMealsForDate(Long userId, LocalDate date) {
        return mealRepository.findByUserIdAndDateWithItems(userId, date).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<MealDto> getMealsForRange(Long userId, LocalDate from, LocalDate to) {
        return mealRepository.findByUserIdAndDateRangeWithItems(userId, from, to).stream().map(this::toDto).toList();
    }

    public MealDto createMeal(Long userId, CreateMealRequest request) {
        User user = userService.findEntity(userId);
        Meal meal = Meal.builder()
                .user(user)
                .mealDate(request.date())
                .name(request.name().trim())
                .type(request.type())
                .build();

        for (MealItemRequest itemRequest : request.items()) {
            MealItem item = MealItem.builder()
                    .itemType(itemRequest.itemType())
                    .name(itemRequest.name().trim())
                    .grams(itemRequest.grams())
                    .proteinG(nvl(itemRequest.proteinG()))
                    .carbsG(nvl(itemRequest.carbsG()))
                    .fatG(nvl(itemRequest.fatG()))
                    .build();
            meal.addItem(item);
        }

        return toDto(mealRepository.save(meal));
    }

    public MealDto updateMeal(Long userId, Long mealId, CreateMealRequest request) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Meal " + mealId + " not found"));
        if (!meal.getUser().getId().equals(userId)) {
            throw new NotFoundException("Meal " + mealId + " not found");
        }

        meal.setMealDate(request.date());
        meal.setName(request.name().trim());
        meal.setType(request.type());

        meal.getItems().clear();
        for (MealItemRequest itemRequest : request.items()) {
            MealItem item = MealItem.builder()
                    .itemType(itemRequest.itemType())
                    .name(itemRequest.name().trim())
                    .grams(itemRequest.grams())
                    .proteinG(nvl(itemRequest.proteinG()))
                    .carbsG(nvl(itemRequest.carbsG()))
                    .fatG(nvl(itemRequest.fatG()))
                    .build();
            meal.addItem(item);
        }

        return toDto(mealRepository.save(meal));
    }

    public void deleteMeal(Long userId, Long mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Meal " + mealId + " not found"));
        if (!meal.getUser().getId().equals(userId)) {
            throw new NotFoundException("Meal " + mealId + " not found");
        }
        mealRepository.delete(meal);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    MealDto toDto(Meal meal) {
        List<MealItemDto> itemDtos = meal.getItems().stream()
                .map(this::toItemDto)
                .toList();

        MacroTotals totals = meal.getItems().stream()
                .filter(i -> i.getItemType() == MealItemType.INGREDIENT)
                .map(i -> MacroTotals.of(i.getProteinG(), i.getCarbsG(), i.getFatG()))
                .reduce(MacroTotals.zero(), MacroTotals::plus);

        BigDecimal veggiesG = meal.getItems().stream()
                .filter(i -> i.getItemType() == MealItemType.VEGGIE)
                .map(MealItem::getGrams)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MealDto(meal.getId(), meal.getMealDate(), meal.getName(), meal.getType(), itemDtos, totals, veggiesG, meal.getCreatedAt());
    }

    private MealItemDto toItemDto(MealItem item) {
        BigDecimal calories = item.getItemType() == MealItemType.INGREDIENT
                ? MacroTotals.of(item.getProteinG(), item.getCarbsG(), item.getFatG()).calories()
                : BigDecimal.ZERO;
        return new MealItemDto(item.getId(), item.getItemType(), item.getName(), item.getGrams(),
                item.getProteinG(), item.getCarbsG(), item.getFatG(), calories);
    }
}
