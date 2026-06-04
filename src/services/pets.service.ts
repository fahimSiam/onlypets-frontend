import { apiClient } from './api.client';
import type { Pet } from '../types/user.types';

export const petsService = {
  async getMyPets(): Promise<Pet[]> {
    const res = await apiClient.get<{ data: Pet[] }>('/pets/mine');
    return res.data.data;
  },
  async getPet(id: string): Promise<Pet> {
    const res = await apiClient.get<{ data: Pet }>(`/pets/${id}`);
    return res.data.data;
  },
  async createPet(data: Partial<Pet>): Promise<Pet> {
    const res = await apiClient.post<{ data: Pet }>('/pets', data);
    return res.data.data;
  },
  async updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
    const res = await apiClient.patch<{ data: Pet }>(`/pets/${id}`, data);
    return res.data.data;
  },
  async deletePet(id: string): Promise<void> {
    await apiClient.delete(`/pets/${id}`);
  },
};
