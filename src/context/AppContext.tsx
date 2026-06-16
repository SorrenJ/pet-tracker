import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, Pet, MealLog, MealReminder, MealBudget, ExerciseSession, ExerciseReminder, HealthDocument, DistanceUnit } from '../types';
import { loadState, saveState } from '../utils/storage';
import * as exerciseApi from '../api/exercise';
import * as healthDocsApi from '../api/healthDocs';
import type { HealthDocInput } from '../api/healthDocs';

type Action =
  | { type: 'SET_PETS'; pets: Pet[] }
  | { type: 'ADD_PET'; pet: Pet }
  | { type: 'UPDATE_PET'; pet: Pet }
  | { type: 'DELETE_PET'; petId: string }
  | { type: 'SET_ACTIVE_PET'; petId: string }
  | { type: 'ADD_MEAL_LOG'; log: Omit<MealLog, 'id'> }
  | { type: 'DELETE_MEAL_LOG'; id: string }
  | { type: 'ADD_MEAL_REMINDER'; reminder: Omit<MealReminder, 'id'> }
  | { type: 'UPDATE_MEAL_REMINDER'; reminder: MealReminder }
  | { type: 'DELETE_MEAL_REMINDER'; id: string }
  | { type: 'SET_MEAL_BUDGET'; budget: MealBudget }
  | { type: 'ADD_EXERCISE_SESSION'; session: Omit<ExerciseSession, 'id'> | ExerciseSession }
  | { type: 'DELETE_EXERCISE_SESSION'; id: string }
  | { type: 'ADD_EXERCISE_REMINDER'; reminder: Omit<ExerciseReminder, 'id'> }
  | { type: 'UPDATE_EXERCISE_REMINDER'; reminder: ExerciseReminder }
  | { type: 'DELETE_EXERCISE_REMINDER'; id: string }
  | { type: 'ADD_HEALTH_DOC'; doc: Omit<HealthDocument, 'id'> | HealthDocument }
  | { type: 'UPDATE_HEALTH_DOC'; doc: HealthDocument }
  | { type: 'DELETE_HEALTH_DOC'; id: string }
  | { type: 'SET_DISTANCE_UNIT'; unit: DistanceUnit };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PETS': {
      const ids = new Set(action.pets.map(p => p.id));
      const activePetId = ids.has(state.activePetId ?? '') ? state.activePetId : (action.pets[0]?.id ?? null);
      return { ...state, pets: action.pets, activePetId };
    }
    case 'ADD_PET': {
      const pets = [...state.pets, action.pet];
      return { ...state, pets, activePetId: state.activePetId ?? action.pet.id };
    }
    case 'UPDATE_PET':
      return { ...state, pets: state.pets.map(p => p.id === action.pet.id ? action.pet : p) };
    case 'DELETE_PET': {
      const pets = state.pets.filter(p => p.id !== action.petId);
      const activePetId = state.activePetId === action.petId ? (pets[0]?.id ?? null) : state.activePetId;
      return { ...state, pets, activePetId };
    }
    case 'SET_ACTIVE_PET':
      return { ...state, activePetId: action.petId };
    case 'ADD_MEAL_LOG':
      return { ...state, mealLogs: [{ ...action.log, id: generateId() }, ...state.mealLogs] };
    case 'DELETE_MEAL_LOG':
      return { ...state, mealLogs: state.mealLogs.filter(l => l.id !== action.id) };
    case 'ADD_MEAL_REMINDER':
      return { ...state, mealReminders: [...state.mealReminders, { ...action.reminder, id: generateId() }] };
    case 'UPDATE_MEAL_REMINDER':
      return { ...state, mealReminders: state.mealReminders.map(r => r.id === action.reminder.id ? action.reminder : r) };
    case 'DELETE_MEAL_REMINDER':
      return { ...state, mealReminders: state.mealReminders.filter(r => r.id !== action.id) };
    case 'SET_MEAL_BUDGET': {
      const existing = state.mealBudgets.find(b => b.petId === action.budget.petId);
      const mealBudgets = existing
        ? state.mealBudgets.map(b => b.petId === action.budget.petId ? action.budget : b)
        : [...state.mealBudgets, action.budget];
      return { ...state, mealBudgets };
    }
    case 'ADD_EXERCISE_SESSION': {
      const incoming = action.session as any;
      const session = incoming.id ? (incoming as ExerciseSession) : { ...(action.session as Omit<ExerciseSession, 'id'>), id: generateId() } as ExerciseSession;
      return { ...state, exerciseSessions: [session, ...state.exerciseSessions] };
    }
    case 'DELETE_EXERCISE_SESSION':
      return { ...state, exerciseSessions: state.exerciseSessions.filter(s => s.id !== action.id) };
    case 'ADD_EXERCISE_REMINDER':
      return { ...state, exerciseReminders: [...state.exerciseReminders, { ...action.reminder, id: generateId() }] };
    case 'UPDATE_EXERCISE_REMINDER':
      return { ...state, exerciseReminders: state.exerciseReminders.map(r => r.id === action.reminder.id ? action.reminder : r) };
    case 'DELETE_EXERCISE_REMINDER':
      return { ...state, exerciseReminders: state.exerciseReminders.filter(r => r.id !== action.id) };
    case 'ADD_HEALTH_DOC': {
      const incoming = action.doc as any;
      const doc = incoming.id ? (incoming as HealthDocument) : { ...(action.doc as Omit<HealthDocument, 'id'>), id: generateId() } as HealthDocument;
      return { ...state, healthDocuments: [doc, ...state.healthDocuments] };
    }
    case 'UPDATE_HEALTH_DOC':
      return { ...state, healthDocuments: state.healthDocuments.map(d => d.id === action.doc.id ? action.doc : d) };
    case 'DELETE_HEALTH_DOC':
      return { ...state, healthDocuments: state.healthDocuments.filter(d => d.id !== action.id) };
    case 'SET_DISTANCE_UNIT':
      return { ...state, distanceUnit: action.unit };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activePet: Pet | null;
  addExerciseSession: (data: Omit<ExerciseSession, 'id'>) => Promise<void>;
  addHealthDoc: (data: HealthDocInput & { fileData?: string; fileType?: string; fileName?: string }) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activePet = state.pets.find(p => p.id === state.activePetId) ?? null;

  async function addExerciseSession(data: Omit<ExerciseSession, 'id'>) {
    try {
      const created = await exerciseApi.createExerciseSession(data);
      dispatch({ type: 'ADD_EXERCISE_SESSION', session: created });
    } catch (err) {
      // fallback to local-only save when API is unavailable
      dispatch({ type: 'ADD_EXERCISE_SESSION', session: data });
    }
  }

  async function addHealthDoc(data: HealthDocInput & { fileData?: string; fileType?: string; fileName?: string }) {
    try {
      const created = await healthDocsApi.createHealthDoc(data);
      dispatch({
        type: 'ADD_HEALTH_DOC',
        doc: {
          ...created,
          fileData: data.fileData,
          fileType: data.fileType,
          fileName: data.fileName,
        },
      });
    } catch (err) {
      // fallback: persist locally with any provided preview data
      const localDoc = {
        petId: data.petId,
        category: data.category,
        name: data.name,
        date: data.date,
        notes: data.notes,
        amount: data.amount,
        fileData: data.fileData,
        fileType: data.fileType,
        fileName: data.fileName,
      } as any;
      dispatch({ type: 'ADD_HEALTH_DOC', doc: localDoc });
    }
  }

  const value = { state, dispatch, activePet, addExerciseSession, addHealthDoc };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useActivePetData() {
  const { state, activePet } = useApp();
  const petId = activePet?.id;

  const mealLogs = state.mealLogs.filter(l => l.petId === petId);
  const mealReminders = state.mealReminders.filter(r => r.petId === petId);
  const mealBudget = state.mealBudgets.find(b => b.petId === petId) ?? null;
  const exerciseSessions = state.exerciseSessions.filter(s => s.petId === petId);
  const exerciseReminders = state.exerciseReminders.filter(r => r.petId === petId);
  const healthDocuments = state.healthDocuments.filter(d => d.petId === petId);

  const getCurrentMonthExpenses = useCallback(() => {
    const now = new Date();
    return mealLogs
      .filter(l => {
        const d = new Date(l.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, l) => sum + (l.cost ?? 0), 0);
  }, [mealLogs]);

  return {
    activePet,
    mealLogs,
    mealReminders,
    mealBudget,
    exerciseSessions,
    exerciseReminders,
    healthDocuments,
    getCurrentMonthExpenses,
  };
}
