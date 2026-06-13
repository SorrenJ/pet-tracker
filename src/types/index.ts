export type Species = 'dog' | 'cat' | 'other';
export type WeightUnit = 'kg' | 'lbs';
export type AmountUnit = 'cups' | 'grams' | 'oz';
export type DocCategory = 'vet_record' | 'prescription' | 'billing' | 'other';
export type DistanceUnit = 'km' | 'miles';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  weight: number;
  weightUnit: WeightUnit;
  birthDate: string;
  photo?: string;
}

export interface MealLog {
  id: string;
  petId: string;
  foodType: string;
  amount: number;
  unit: AmountUnit;
  timestamp: string;
  cost?: number;
  notes?: string;
}

export interface MealReminder {
  id: string;
  petId: string;
  time: string;
  days: number[];
  enabled: boolean;
  label: string;
}

export interface MealBudget {
  petId: string;
  monthlyBudget: number;
  currency: string;
}

export interface ExerciseSession {
  id: string;
  petId: string;
  date: string;
  steps: number;
  distanceKm: number;
  durationMinutes: number;
  notes?: string;
}

export interface ExerciseReminder {
  id: string;
  petId: string;
  time: string;
  days: number[];
  enabled: boolean;
  label: string;
}

export interface HealthDocument {
  id: string;
  petId: string;
  category: DocCategory;
  name: string;
  date: string;
  fileData?: string;
  fileType?: string;
  fileName?: string;
  notes?: string;
  amount?: number;
}

export interface AppState {
  pets: Pet[];
  activePetId: string | null;
  mealLogs: MealLog[];
  mealReminders: MealReminder[];
  mealBudgets: MealBudget[];
  exerciseSessions: ExerciseSession[];
  exerciseReminders: ExerciseReminder[];
  healthDocuments: HealthDocument[];
  distanceUnit: DistanceUnit;
}
