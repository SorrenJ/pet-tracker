import { apiFetchForm, apiDelete, apiFetch } from './client';
import type { HealthDocument, DocCategory } from '../types';

export interface HealthDocInput {
  petId: string;
  category: DocCategory;
  name: string;
  date: string;
  notes?: string;
  amount?: number;
  /** File to upload (images or PDF, max 10 MB) */
  file?: File;
}

function toFormData(data: HealthDocInput): FormData {
  const form = new FormData();
  form.append('petId', data.petId);
  form.append('category', data.category);
  form.append('name', data.name);
  form.append('date', data.date);
  if (data.notes != null) form.append('notes', data.notes);
  if (data.amount != null) form.append('amount', String(data.amount));
  if (data.file) form.append('file', data.file);
  return form;
}

export async function getHealthDocs(petId: string): Promise<HealthDocument[]> {
  return apiFetch<HealthDocument[]>(`/health-docs?petId=${petId}`);
}

export async function createHealthDoc(data: HealthDocInput): Promise<HealthDocument> {
  return apiFetchForm<HealthDocument>('/health-docs', toFormData(data), 'POST');
}

export async function updateHealthDoc(id: string, data: Partial<HealthDocInput>): Promise<HealthDocument> {
  return apiFetchForm<HealthDocument>(`/health-docs/${id}`, toFormData(data as HealthDocInput), 'PUT');
}

export async function deleteHealthDoc(id: string): Promise<void> {
  return apiDelete(`/health-docs/${id}`);
}
