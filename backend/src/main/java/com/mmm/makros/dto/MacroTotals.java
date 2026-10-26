package com.mmm.makros.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Macro totals in grams, with calories derived using the standard Atwater factors
 * (protein 4 kcal/g, carbs 4 kcal/g, fat 9 kcal/g).
 */
public record MacroTotals(BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG, BigDecimal calories) {

    public static MacroTotals of(BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
        BigDecimal calories = proteinG.multiply(BigDecimal.valueOf(4))
                .add(carbsG.multiply(BigDecimal.valueOf(4)))
                .add(fatG.multiply(BigDecimal.valueOf(9)))
                .setScale(1, RoundingMode.HALF_UP);
        return new MacroTotals(proteinG, carbsG, fatG, calories);
    }

    public static MacroTotals zero() {
        return of(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public MacroTotals plus(MacroTotals other) {
        return of(proteinG.add(other.proteinG), carbsG.add(other.carbsG), fatG.add(other.fatG));
    }

    public MacroTotals minus(MacroTotals other) {
        return of(proteinG.subtract(other.proteinG), carbsG.subtract(other.carbsG), fatG.subtract(other.fatG));
    }
}
