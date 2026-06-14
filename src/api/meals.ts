import { apiFetch, apiDelete } from './client';
import type { MealLog, MealReminder, MealBudget } from '../types';

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
