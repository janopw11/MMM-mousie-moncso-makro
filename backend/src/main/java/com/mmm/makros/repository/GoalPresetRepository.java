package com.mmm.makros.repository;

import com.mmm.makros.entity.GoalPreset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalPresetRepository extends JpaRepository<GoalPreset, Long> {
    List<GoalPreset> findByUserIdOrderByNameAsc(Long userId);
    Optional<GoalPreset> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
