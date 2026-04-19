import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
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
    });
  });

  it('updates activeThreadId correctly', () => {
    const { setActiveThreadId } = useAppStore.getState();
    setActiveThreadId('thread-123');
    expect(useAppStore.getState().activeThreadId).toBe('thread-123');
  });

  it('updates weights partially', () => {
    const { setWeights } = useAppStore.getState();
    setWeights({ innovation: 80 });
    expect(useAppStore.getState().weights.innovation).toBe(80);
    expect(useAppStore.getState().weights.feasibility).toBe(50);
  });

  it('updates filters partially', () => {
    const { setFilter } = useAppStore.getState();
    setFilter({ search: 'hello' });
    expect(useAppStore.getState().filters.search).toBe('hello');
    expect(useAppStore.getState().filters.category).toBe('All');
  });

  it('resets filters correctly', () => {
    const { setFilter, resetFilters } = useAppStore.getState();
    setFilter({ category: 'SaaS', search: 'test' });
    resetFilters();
    expect(useAppStore.getState().filters).toEqual({
      category: 'All',
      search: '',
      aiStatus: 'All',
    });
  });

  it('handles 200+ state updates rapidly and maintains consistency', () => {
    const { setWeights } = useAppStore.getState();
    
    for (let i = 0; i < 210; i++) {
        setWeights({ feasibility: i });
    }
    
    expect(useAppStore.getState().weights.feasibility).toBe(209);
  });
});
