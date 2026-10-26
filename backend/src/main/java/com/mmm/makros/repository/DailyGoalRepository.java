package com.mmm.makros.repository;

import com.mmm.makros.entity.DailyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyGoalRepository extends JpaRepository<DailyGoal, Long> {
    Optional<DailyGoal> findByUserIdAndGoalDate(Long userId, LocalDate goalDate);
    List<DailyGoal> findByUserIdAndGoalDateBetweenOrderByGoalDateAsc(Long userId, LocalDate from, LocalDate to);
}
