import type { Person, Gift, CreatePersonInput, CreateGiftInput, UpdateGiftInput } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

// People API
export const peopleApi = {
  getAll: async (): Promise<Person[]> => {
    const response = await fetch(`${API_BASE}/people`);
    if (!response.ok) throw new Error('Failed to fetch people');
    return response.json();
  },

  getById: async (id: string): Promise<Person> => {
    const response = await fetch(`${API_BASE}/people/${id}`);
    if (!response.ok) throw new Error('Failed to fetch person');
    return response.json();
  },

  create: async (data: CreatePersonInput): Promise<Person> => {
    const response = await fetch(`${API_BASE}/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create person');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/people/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete person');
  },
};

// Gifts API
export const giftsApi = {
  getByPersonId: async (personId: string): Promise<Gift[]> => {
    const response = await fetch(`${API_BASE}/people/${personId}/gifts`);
    if (!response.ok) throw new Error('Failed to fetch gifts');
    return response.json();
  },

  create: async (data: CreateGiftInput): Promise<Gift> => {
    const response = await fetch(`${API_BASE}/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create gift');
    return response.json();
  },

  update: async (id: string, data: UpdateGiftInput): Promise<Gift> => {
    const response = await fetch(`${API_BASE}/gifts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update gift');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/gifts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete gift');
  },

  selectGift: async (personId: string, giftId: string): Promise<Gift> => {
    const response = await fetch(`${API_BASE}/people/${personId}/gifts/${giftId}/select`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to select gift');
    return response.json();
  },
};
