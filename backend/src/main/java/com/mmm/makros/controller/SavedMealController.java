package com.mmm.makros.controller;

import com.mmm.makros.dto.SavedMealDto;
import com.mmm.makros.dto.UpdateSavedMealRequest;
import com.mmm.makros.service.SavedMealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-meals")
@RequiredArgsConstructor
public class SavedMealController {

    private static final int MAX_LIMIT = 500;

    private final SavedMealService savedMealService;

    @GetMapping
    public List<SavedMealDto> search(@RequestParam(required = false) String search,
                                     @RequestParam(defaultValue = "20") int limit) {
        return savedMealService.search(search, Math.max(1, Math.min(limit, MAX_LIMIT)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavedMealDto create(@Valid @RequestBody UpdateSavedMealRequest request) {
        return savedMealService.create(request);
    }

    @PutMapping("/{id}")
    public SavedMealDto update(@PathVariable Long id, @Valid @RequestBody UpdateSavedMealRequest request) {
        return savedMealService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        savedMealService.delete(id);
    }
}
