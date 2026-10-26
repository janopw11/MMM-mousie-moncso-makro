package com.mmm.makros.service;

import com.mmm.makros.dto.MacroTotals;
import com.mmm.makros.dto.MealItemDto;
import com.mmm.makros.dto.MealItemRequest;
import com.mmm.makros.dto.SavedMealDto;
import com.mmm.makros.entity.MealItemType;
import com.mmm.makros.entity.MealType;
import com.mmm.makros.entity.SavedMeal;
import com.mmm.makros.entity.SavedMealItem;
import com.mmm.makros.repository.SavedMealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class SavedMealService {

    private static final int SEARCH_LIMIT = 20;
    private static final Pattern NON_WORD = Pattern.compile("[^\\p{L}\\p{N}]+");

    private final SavedMealRepository savedMealRepository;

    @Value("${mmm.search.full-text:true}")
    private boolean fullTextEnabled;

    @Transactional(readOnly = true)
    public List<SavedMealDto> search(String query) {
        String q = query == null ? "" : query.trim();
        List<Long> ids;
        if (q.isEmpty()) {
            ids = savedMealRepository.findAllByOrderByNameAsc(PageRequest.of(0, SEARCH_LIMIT))
                    .stream().map(SavedMeal::getId).toList();
        } else if (fullTextEnabled) {
            String tsQuery = toPrefixTsQuery(q);
            ids = tsQuery.isEmpty()
                    ? List.of()
                    : savedMealRepository.fullTextSearchIds(tsQuery, q, SEARCH_LIMIT);
        } else {
            ids = savedMealRepository.findIdsByNameContaining(q, PageRequest.of(0, SEARCH_LIMIT));
        }
        if (ids.isEmpty()) {
            return List.of();
        }
        return savedMealRepository.findByIdsWithItems(ids).stream().map(this::toDto).toList();
    }

    /** Saves the meal definition for all users unless a meal with the same name already exists. */
    public void saveIfAbsent(Long userId, String name, MealType type, List<MealItemRequest> items) {
        String trimmed = name.trim();
        if (savedMealRepository.existsByNameIgnoreCase(trimmed)) {
            return;
        }
        SavedMeal saved = SavedMeal.builder().name(trimmed).type(type).createdByUserId(userId).build();
        for (MealItemRequest r : items) {
            saved.addItem(SavedMealItem.builder()
                    .itemType(r.itemType())
                    .name(r.name().trim())
                    .grams(r.grams())
                    .proteinG(nvl(r.proteinG()))
                    .carbsG(nvl(r.carbsG()))
                    .fatG(nvl(r.fatG()))
                    .build());
        }
        savedMealRepository.save(saved);
    }

    private static String toPrefixTsQuery(String q) {
        List<String> terms = new ArrayList<>();
        for (String token : NON_WORD.split(q)) {
            if (!token.isEmpty()) {
                terms.add(token + ":*");
            }
        }
        return String.join(" & ", terms);
    }

    private static BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private SavedMealDto toDto(SavedMeal meal) {
        List<MealItemDto> items = meal.getItems().stream().map(i -> {
            BigDecimal calories = i.getItemType() == MealItemType.INGREDIENT
                    ? MacroTotals.of(i.getProteinG(), i.getCarbsG(), i.getFatG()).calories()
                    : BigDecimal.ZERO;
            return new MealItemDto(i.getId(), i.getItemType(), i.getName(), i.getGrams(),
                    i.getProteinG(), i.getCarbsG(), i.getFatG(), calories);
        }).toList();

        MacroTotals totals = meal.getItems().stream()
                .filter(i -> i.getItemType() == MealItemType.INGREDIENT)
                .map(i -> MacroTotals.of(i.getProteinG(), i.getCarbsG(), i.getFatG()))
                .reduce(MacroTotals.zero(), MacroTotals::plus);
        BigDecimal veggiesG = meal.getItems().stream()
                .filter(i -> i.getItemType() == MealItemType.VEGGIE)
                .map(SavedMealItem::getGrams)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new SavedMealDto(meal.getId(), meal.getName(), meal.getType(), items, totals, veggiesG);
    }
}
