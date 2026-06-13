import type { AppState } from '../types';

const KEY = 'pettracker_state';

const defaultState: AppState = {
  pets: [],
  activePetId: null,
  mealLogs: [],
  mealReminders: [],
  mealBudgets: [],
  exerciseSessions: [],
  exerciseReminders: [],
  healthDocuments: [],
  distanceUnit: 'km',
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
