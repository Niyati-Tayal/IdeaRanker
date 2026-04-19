import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterPanel } from './FilterPanel';
import { useAppStore } from '../lib/store';

describe('FilterPanel Stress Test', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeThreadId: null,
      weights: { feasibility: 50, marketPotential: 50, innovation: 50, effort: 50 },
      filters: { category: 'All', search: '', aiStatus: 'All' },
    });
  });

  const categories = ['All', 'SaaS', 'Hardware', 'Service', 'Other'];
  
  categories.forEach(cat => {
    it(`updates category filter to ${cat}`, () => {
      render(<FilterPanel />);
      fireEvent.click(screen.getByText(cat));
      expect(useAppStore.getState().filters.category).toBe(cat);
    });
  });

  it('handles 100 rapid search input changes', () => {
    render(<FilterPanel />);
    const input = screen.getByPlaceholderText('Filter ideas...') as HTMLInputElement;
    
    for (let i = 0; i < 100; i++) {
      fireEvent.change(input, { target: { value: `search-${i}` } });
    }
    
    expect(useAppStore.getState().filters.search).toBe('search-99');
  });

  it('handles 100 rapid weight slider mock changes', () => {
    // Since slider is hard to test in JSDOM without proper layout, we test the store directly
    // based on how FilterPanel would call it.
    const { setWeights } = useAppStore.getState();
    for (let i = 0; i < 110; i++) {
        setWeights({ innovation: i % 101 });
    }
    expect(useAppStore.getState().weights.innovation).toBe(109 % 101); // 8
  });
});
