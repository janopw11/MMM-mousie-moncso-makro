import type { MealType } from '../types/api';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
  PRE_WORKOUT: 'Pre-workout',
  POST_WORKOUT: 'Post-workout',
};

export const MEAL_TYPE_ORDER: MealType[] = [
  'BREAKFAST',
  'LUNCH',
  'DINNER',
  'SNACK',
  'PRE_WORKOUT',
  'POST_WORKOUT',
];

export const MACRO_COLORS = {
  protein: 'var(--protein-color)',
  carbs: 'var(--carbs-color)',
  fat: 'var(--fat-color)',
  veggies: 'var(--veggie-color)',
};

export const MACRO_COLORS_HEX = {
  protein: '#ef6c8e',
  carbs: '#4fb0ce',
  fat: '#f6c343',
  veggies: '#5cb85c',
};
