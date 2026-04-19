import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddIdeaForm } from './AddIdeaForm';
import { auth } from '../lib/firebase';

// Mock lib/gemini to avoid actual API calls (even with mocked @google/genai, this is safer)
vi.mock('../lib/gemini', () => ({
  enrichIdea: vi.fn().mockResolvedValue({
    scores: { feasibility: 8, marketPotential: 9, innovation: 7, effort: 4 }
  })
}));

describe('AddIdeaForm', () => {
  const mockOnSuccess = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AddIdeaForm threadId="thread-1" nextSno={1} onSuccess={mockOnSuccess} />);
    expect(screen.getByPlaceholderText('Idea Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Core Description')).toBeInTheDocument();
    expect(screen.getByText('Launch Idea Analysis')).toBeInTheDocument();
  });

  it('submits correctly and calls onSuccess', async () => {
    render(<AddIdeaForm threadId="thread-1" nextSno={1} onSuccess={mockOnSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('Idea Name'), { target: { value: 'Test Idea' } });
    fireEvent.change(screen.getByPlaceholderText('Core Description'), { target: { value: 'Test Description' } });
    
    fireEvent.click(screen.getByText('Launch Idea Analysis'));
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('prevents submission if name is missing', () => {
    render(<AddIdeaForm threadId="thread-1" nextSno={1} onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByText('Launch Idea Analysis'));
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles 200 potential iterations of form data changes without crashing', () => {
    render(<AddIdeaForm threadId="thread-1" nextSno={1} onSuccess={mockOnSuccess} />);
    const nameInput = screen.getByPlaceholderText('Idea Name') as HTMLInputElement;
    
    for (let i = 0; i < 200; i++) {
      fireEvent.change(nameInput, { target: { value: `Idea ${i}` } });
    }
    
    expect(nameInput.value).toBe('Idea 199');
  });
});
