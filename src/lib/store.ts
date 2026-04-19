import { create } from 'zustand';

interface RankingWeights {
  feasibility: number;
  marketPotential: number;
  innovation: number;
  effort: number;
}

interface ThreadFilters {
  category: string;
  search: string;
  aiStatus: string;
}

interface AppState {
  activeThreadId: string | null;
  weights: RankingWeights;
  filters: ThreadFilters;
  setActiveThreadId: (id: string | null) => void;
  setWeights: (weights: Partial<RankingWeights>) => void;
  setFilter: (filter: Partial<ThreadFilters>) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeThreadId: null,
  weights: {
    feasibility: 50,
    marketPotential: 50,
    innovation: 50,
    effort: 50,
  },
  filters: {
    category: 'All',
    search: '',
    aiStatus: 'All',
  },
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  setWeights: (newWeights) => set((state) => ({ 
    weights: { ...state.weights, ...newWeights } 
  })),
  setFilter: (newFilter) => set((state) => ({ 
    filters: { ...state.filters, ...newFilter } 
  })),
  resetFilters: () => set({
    filters: {
      category: 'All',
      search: '',
      aiStatus: 'All',
    }
  }),
}));
