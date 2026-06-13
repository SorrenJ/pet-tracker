import type { Pet, Species } from '../types';

export function weightToKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? weight * 0.453592 : weight;
}

export function recommendedDailyFood(pet: Pet): { min: number; max: number; unit: string } {
  const kg = weightToKg(pet.weight, pet.weightUnit);
  if (pet.species === 'dog') {
    const min = Math.round(kg * 20);
    const max = Math.round(kg * 30);
    return { min, max, unit: 'grams' };
  }
  if (pet.species === 'cat') {
    const min = Math.round(kg * 20);
    const max = Math.round(kg * 35);
    return { min, max, unit: 'grams' };
  }
  const min = Math.round(kg * 15);
  const max = Math.round(kg * 25);
  return { min, max, unit: 'grams' };
}

export function recommendedDailyDistance(species: Species): { min: number; max: number; unit: string } {
  if (species === 'dog') return { min: 3, max: 8, unit: 'km' };
  if (species === 'cat') return { min: 0.5, max: 1.5, unit: 'km' };
  return { min: 1, max: 3, unit: 'km' };
}

export function recommendedDailySteps(species: Species): { min: number; max: number } {
  if (species === 'dog') return { min: 6000, max: 16000 };
  if (species === 'cat') return { min: 1000, max: 3000 };
  return { min: 2000, max: 6000 };
}

const DOG_STRIDE_M = 0.5;
const CAT_STRIDE_M = 0.3;

export function stepsToKm(steps: number, species: Species): number {
  const stride = species === 'dog' ? DOG_STRIDE_M : species === 'cat' ? CAT_STRIDE_M : 0.4;
  return Math.round(steps * stride) / 1000;
}

export function stepsToMiles(steps: number, species: Species): number {
  return Math.round(stepsToKm(steps, species) * 0.621371 * 1000) / 1000;
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371 * 100) / 100;
}

export function getAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  if (totalMonths < 1) return 'less than 1 month';
  if (totalMonths < 12) return `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y}y ${m}m` : `${y} year${y === 1 ? '' : 's'}`;
}
