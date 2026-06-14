import { apiFetch, apiDelete } from './client';
import type { Pet } from '../types';

type PetInput = Omit<Pet, 'id'>;

export async function getPets(): Promise<Pet[]> {
  return apiFetch<Pet[]>('/pets');
}

export async function getPet(petId: string): Promise<Pet> {
  return apiFetch<Pet>(`/pets/${petId}`);
}

export async function createPet(data: PetInput): Promise<Pet> {
  return apiFetch<Pet>('/pets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePet(petId: string, data: Partial<PetInput>): Promise<Pet> {
  return apiFetch<Pet>(`/pets/${petId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePet(petId: string): Promise<void> {
  return apiDelete(`/pets/${petId}`);
}
