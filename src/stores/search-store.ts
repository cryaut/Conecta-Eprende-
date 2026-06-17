import { create } from 'zustand';

interface SearchState {
  query: string;
  city: string | null;
  hoveredProviderId: string | null;
  filters: { maxPrice?: number; category?: string };
  setQuery: (q: string) => void;
  setCity: (city: string | null) => void;
  setHoveredProviderId: (id: string | null) => void;
  setFilters: (filters: { maxPrice?: number; category?: string }) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  city: null,
  hoveredProviderId: null,
  filters: {},
  setQuery: (query) => set({ query }),
  setCity: (city) => set({ city }),
  setHoveredProviderId: (hoveredProviderId) => set({ hoveredProviderId }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
}));
