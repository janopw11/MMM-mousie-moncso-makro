package com.mmm.makros.service;

import com.mmm.makros.dto.CreateGoalPresetRequest;
import com.mmm.makros.dto.GoalPresetDto;
import com.mmm.makros.dto.MacroTotals;
import com.mmm.makros.entity.GoalPreset;
import com.mmm.makros.entity.User;
import com.mmm.makros.exception.ConflictException;
import com.mmm.makros.exception.NotFoundException;
import com.mmm.makros.repository.GoalPresetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalPresetService {

    private final GoalPresetRepository presetRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<GoalPresetDto> list(Long userId) {
        userService.findEntity(userId);
        return presetRepository.findByUserIdOrderByNameAsc(userId).stream().map(this::toDto).toList();
    }

    public GoalPresetDto create(Long userId, CreateGoalPresetRequest request) {
        User user = userService.findEntity(userId);
        String name = request.name().trim();
        if (presetRepository.existsByUserIdAndNameIgnoreCase(userId, name)) {
            throw new ConflictException("A preset named '" + name + "' already exists");
        }
        GoalPreset preset = GoalPreset.builder()
                .user(user)
                .name(name)
                .proteinG(request.proteinG())
                .carbsG(request.carbsG())
                .fatG(request.fatG())
                .veggiesGoalG(request.veggiesGoalG() != null ? request.veggiesGoalG() : user.getVeggieGoalG())
                .build();
        return toDto(presetRepository.save(preset));
    }

    public void delete(Long userId, Long presetId) {
        GoalPreset preset = presetRepository.findByIdAndUserId(presetId, userId)
                .orElseThrow(() -> new NotFoundException("Preset not found: " + presetId));
        presetRepository.delete(preset);
    }

    private GoalPresetDto toDto(GoalPreset p) {
        return new GoalPresetDto(p.getId(), p.getName(),
                MacroTotals.of(p.getProteinG(), p.getCarbsG(), p.getFatG()), p.getVeggiesGoalG());
    }
}
