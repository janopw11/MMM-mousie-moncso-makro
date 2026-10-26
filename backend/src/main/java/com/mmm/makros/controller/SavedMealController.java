package com.mmm.makros.controller;

import com.mmm.makros.dto.SavedMealDto;
import com.mmm.makros.service.SavedMealService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-meals")
@RequiredArgsConstructor
public class SavedMealController {

    private final SavedMealService savedMealService;

    @GetMapping
    public List<SavedMealDto> search(@RequestParam(required = false) String search) {
        return savedMealService.search(search);
    }
}
