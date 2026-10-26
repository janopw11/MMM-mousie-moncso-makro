package com.mmm.makros.controller;

import com.mmm.makros.dto.DaySummaryDto;
import com.mmm.makros.dto.WeekSummaryDto;
import com.mmm.makros.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/users/{userId}/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/day/{date}")
    public DaySummaryDto getDaySummary(@PathVariable Long userId,
                                        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return summaryService.getDaySummary(userId, date);
    }

    @GetMapping("/week")
    public WeekSummaryDto getWeekSummary(@PathVariable Long userId,
                                          @RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
        return summaryService.getWeekSummary(userId, weekStart);
    }
}
