package com.mmm.makros.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_goals", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "goal_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "goal_date", nullable = false)
    private LocalDate goalDate;

    @Column(name = "protein_g", nullable = false)
    @Builder.Default
    private BigDecimal proteinG = BigDecimal.ZERO;

    @Column(name = "carbs_g", nullable = false)
    @Builder.Default
    private BigDecimal carbsG = BigDecimal.ZERO;

    @Column(name = "fat_g", nullable = false)
    @Builder.Default
    private BigDecimal fatG = BigDecimal.ZERO;

    @Column(name = "veggies_goal_g", nullable = false)
    @Builder.Default
    private Integer veggiesGoalG = 500;
}
