export interface UserDto {
  id: number;
  username: string;
  veggieGoalG: number;
  createdAt: string;
}

export interface MacroTotals {
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
}

export interface DailyGoalDto {
  date: string;
  goal: MacroTotals;
  veggiesGoalG: number;
}

export type MealType =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'PRE_WORKOUT'
  | 'POST_WORKOUT';

export type MealItemType = 'INGREDIENT' | 'VEGGIE';

export interface MealItemDto {
  id: number;
  itemType: MealItemType;
  name: string;
  grams: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
}

export interface MealDto {
  id: number;
  date: string;
  name: string;
  type: MealType;
  items: MealItemDto[];
  macroTotals: MacroTotals;
  veggiesG: number;
  createdAt: string;
}

export interface DaySummaryDto {
  date: string;
  goal: MacroTotals;
  consumed: MacroTotals;
  remaining: MacroTotals;
  veggiesGoalG: number;
  veggiesConsumedG: number;
  veggiesRemainingG: number;
  meals: MealDto[];
}

export interface WeekSummaryDto {
  weekStart: string;
  weekEnd: string;
  days: DaySummaryDto[];
  weekGoalTotal: MacroTotals;
  weekConsumedTotal: MacroTotals;
  weekVeggiesGoalTotalG: number;
  weekVeggiesConsumedTotalG: number;
}

export interface MealItemRequest {
  itemType: MealItemType;
  name: string;
  grams: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface CreateMealRequest {
  date: string;
  name: string;
  type: MealType;
  items: MealItemRequest[];
}

export interface UpdateDailyGoalRequest {
  proteinG: number;
  carbsG: number;
  fatG: number;
  veggiesGoalG?: number;
}

export interface ProductDto {
  id: number;
  name: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  custom: boolean;
}

export interface CreateProductRequest {
  name: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
