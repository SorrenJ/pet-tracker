import { apiFetch, apiDelete } from './client';
import type { MealLog, MealReminder, MealBudget, DailyMealPlan, MealSchedule } from '../types';

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export async function getMealLogs(petId: string): Promise<MealLog[]> {
  return apiFetch<MealLog[]>(`/meals?petId=${petId}`);
}

export async function createMealLog(data: Omit<MealLog, 'id'>): Promise<MealLog> {
  return apiFetch<MealLog>('/meals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteMealLog(id: string): Promise<void> {
  return apiDelete(`/meals/${id}`);
}

// ─── Meal Reminders ───────────────────────────────────────────────────────────

export async function getMealReminders(petId: string): Promise<MealReminder[]> {
  return apiFetch<MealReminder[]>(`/meals/reminders?petId=${petId}`);
}

export async function createMealReminder(data: Omit<MealReminder, 'id'>): Promise<MealReminder> {
  return apiFetch<MealReminder>('/meals/reminders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMealReminder(id: string, data: Partial<Omit<MealReminder, 'id' | 'petId'>>): Promise<MealReminder> {
  return apiFetch<MealReminder>(`/meals/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMealReminder(id: string): Promise<void> {
  return apiDelete(`/meals/reminders/${id}`);
}

// ─── Meal Budget ──────────────────────────────────────────────────────────────

export async function getMealBudget(petId: string): Promise<MealBudget | null> {
  return apiFetch<MealBudget | null>(`/meals/budget?petId=${petId}`);
}

export async function setMealBudget(data: MealBudget): Promise<MealBudget> {
  return apiFetch<MealBudget>('/meals/budget', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Daily Meal Plans ────────────────────────────────────────────────────────

export async function getDailyMealPlans(petId: string): Promise<DailyMealPlan[]> {
  return apiFetch<DailyMealPlan[]>(`/meals/plans?petId=${petId}`);
}

export async function createDailyMealPlan(data: Omit<DailyMealPlan, 'id'>): Promise<DailyMealPlan> {
  return apiFetch<DailyMealPlan>('/meals/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDailyMealPlan(id: string, data: Partial<Omit<DailyMealPlan, 'id' | 'petId'>>): Promise<DailyMealPlan> {
  return apiFetch<DailyMealPlan>(`/meals/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDailyMealPlan(id: string): Promise<void> {
  return apiDelete(`/meals/plans/${id}`);
}

// ─── Meal Schedules (Routines) ───────────────────────────────────────────────

export async function getMealSchedules(petId: string): Promise<MealSchedule[]> {
  return apiFetch<MealSchedule[]>(`/meals/schedules?petId=${petId}`);
}

export async function createMealSchedule(data: Omit<MealSchedule, 'id'>): Promise<MealSchedule> {
  return apiFetch<MealSchedule>('/meals/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMealSchedule(id: string, data: Partial<Omit<MealSchedule, 'id' | 'petId'>>): Promise<MealSchedule> {
  return apiFetch<MealSchedule>(`/meals/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMealSchedule(id: string): Promise<void> {
  return apiDelete(`/meals/schedules/${id}`);
}
