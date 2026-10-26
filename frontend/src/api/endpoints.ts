import { http } from './http';
import type {
  CreateGoalPresetRequest,
  CreateMealRequest,
  CreateProductRequest,
  DailyGoalDto,
  DaySummaryDto,
  GoalPresetDto,
  MealDto,
  ProductDto,
  UpdateDailyGoalRequest,
  UserDto,
  WeekSummaryDto,
} from '../types/api';

export const usersApi = {
  list: () => http.get<UserDto[]>('/users'),
  create: (username: string) => http.post<UserDto>('/users', { username }),
  updateVeggieGoal: (id: number, veggieGoalG: number) =>
    http.patch<UserDto>(`/users/${id}`, { veggieGoalG }),
};

export const goalsApi = {
  getForDate: (userId: number, date: string) =>
    http.get<DailyGoalDto>(`/users/${userId}/goals/${date}`),
  getForWeek: (userId: number, weekStart: string) =>
    http.get<DailyGoalDto[]>(`/users/${userId}/goals?weekStart=${weekStart}`),
  upsert: (userId: number, date: string, request: UpdateDailyGoalRequest) =>
    http.put<DailyGoalDto>(`/users/${userId}/goals/${date}`, request),
};

export const goalPresetsApi = {
  list: (userId: number) => http.get<GoalPresetDto[]>(`/users/${userId}/goal-presets`),
  create: (userId: number, request: CreateGoalPresetRequest) =>
    http.post<GoalPresetDto>(`/users/${userId}/goal-presets`, request),
  remove: (userId: number, presetId: number) =>
    http.delete<void>(`/users/${userId}/goal-presets/${presetId}`),
};

export const mealsApi = {
  getForDate: (userId: number, date: string) =>
    http.get<MealDto[]>(`/users/${userId}/meals?date=${date}`),
  getForRange: (userId: number, from: string, to: string) =>
    http.get<MealDto[]>(`/users/${userId}/meals?from=${from}&to=${to}`),
  create: (userId: number, request: CreateMealRequest) =>
    http.post<MealDto>(`/users/${userId}/meals`, request),
  update: (userId: number, mealId: number, request: CreateMealRequest) =>
    http.put<MealDto>(`/users/${userId}/meals/${mealId}`, request),
  remove: (userId: number, mealId: number) =>
    http.delete<void>(`/users/${userId}/meals/${mealId}`),
};

export const summaryApi = {
  getDay: (userId: number, date: string) =>
    http.get<DaySummaryDto>(`/users/${userId}/summary/day/${date}`),
  getWeek: (userId: number, weekStart: string) =>
    http.get<WeekSummaryDto>(`/users/${userId}/summary/week?weekStart=${weekStart}`),
};

export const productsApi = {
  search: (query: string) =>
    http.get<ProductDto[]>(`/products?search=${encodeURIComponent(query)}`),
  create: (request: CreateProductRequest) => http.post<ProductDto>('/products', request),
};
