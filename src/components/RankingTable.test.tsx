import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RankingTable } from './RankingTable';

// Mock motion to skip animations in tests
vi.mock('motion/react', () => ({
  motion: {
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('RankingTable', () => {
  const mockData = [
    { id: '1', rank: 1, sno: 1, name: 'Idea 1', category: 'SaaS', rankingScore: 8.5, aiStatus: 'complete' },
    { id: '2', rank: 2, sno: 2, name: 'Idea 2', category: 'Hardware', rankingScore: 7.2, aiStatus: 'processing' },
  ];

  const mockOnViewIdea = vi.fn();

  it('renders table headers correctly', () => {
    render(<RankingTable data={mockData} onViewIdea={mockOnViewIdea} />);
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Sno')).toBeInTheDocument();
    expect(screen.getByText('Idea Name')).toBeInTheDocument();
    expect(screen.getByText('Match Score')).toBeInTheDocument();
    expect(screen.getByText('System Sync')).toBeInTheDocument();
  });

  it('renders data rows correctly', () => {
    render(<RankingTable data={mockData} onViewIdea={mockOnViewIdea} />);
    expect(screen.getByText('Idea 1')).toBeInTheDocument();
    expect(screen.getByText('Idea 2')).toBeInTheDocument();
    expect(screen.getByText('SaaS')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('85.0')).toBeInTheDocument(); // 8.5 * 10
  });

  it('calls onViewIdea when a row is clicked', () => {
    render(<RankingTable data={mockData} onViewIdea={mockOnViewIdea} />);
    const firstRow = screen.getByText('Idea 1').closest('tr');
    if (firstRow) fireEvent.click(firstRow);
    expect(mockOnViewIdea).toHaveBeenCalledWith('1');
  });

  it('shows empty state when no data', () => {
    render(<RankingTable data={[]} onViewIdea={mockOnViewIdea} />);
    expect(screen.getByText('No entries in this thread yet.')).toBeInTheDocument();
  });

  it('displays processing status correctly', () => {
    render(<RankingTable data={mockData} onViewIdea={mockOnViewIdea} />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();
  });
});
