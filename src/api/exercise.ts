import { apiFetch, apiDelete } from './client';
import type { ExerciseSession, ExerciseReminder } from '../types';

// ─── Exercise Sessions ────────────────────────────────────────────────────────

export async function getExerciseSessions(petId: string): Promise<ExerciseSession[]> {
  return apiFetch<ExerciseSession[]>(`/exercise?petId=${petId}`);
}

export async function createExerciseSession(data: Omit<ExerciseSession, 'id'>): Promise<ExerciseSession> {
  return apiFetch<ExerciseSession>('/exercise', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteExerciseSession(id: string): Promise<void> {
  return apiDelete(`/exercise/${id}`);
}

// ─── Exercise Reminders ───────────────────────────────────────────────────────

export async function getExerciseReminders(petId: string): Promise<ExerciseReminder[]> {
  return apiFetch<ExerciseReminder[]>(`/exercise/reminders?petId=${petId}`);
}

export async function createExerciseReminder(data: Omit<ExerciseReminder, 'id'>): Promise<ExerciseReminder> {
  return apiFetch<ExerciseReminder>('/exercise/reminders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExerciseReminder(id: string, data: Partial<Omit<ExerciseReminder, 'id' | 'petId'>>): Promise<ExerciseReminder> {
  return apiFetch<ExerciseReminder>(`/exercise/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteExerciseReminder(id: string): Promise<void> {
  return apiDelete(`/exercise/reminders/${id}`);
}
