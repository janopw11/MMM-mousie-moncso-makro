package com.mmm.makros.repository;

import com.mmm.makros.entity.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {

    @Query("select distinct m from Meal m left join fetch m.items where m.user.id = :userId and m.mealDate = :date order by m.createdAt asc")
    List<Meal> findByUserIdAndDateWithItems(Long userId, LocalDate date);

    @Query("select distinct m from Meal m left join fetch m.items where m.user.id = :userId and m.mealDate between :from and :to order by m.mealDate asc, m.createdAt asc")
    List<Meal> findByUserIdAndDateRangeWithItems(Long userId, LocalDate from, LocalDate to);
}
