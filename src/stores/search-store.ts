import { create } from 'zustand';

interface SearchState {
  query: string;
  city: string | null;
  filters: { maxPrice?: number; category?: string };
  setQuery: (q: string) => void;
  setCity: (city: string | null) => void;
  setFilters: (filters: { maxPrice?: number; category?: string }) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  city: null,
  filters: {},
  setQuery: (query) => set({ query }),
  setCity: (city) => set({ city }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));
