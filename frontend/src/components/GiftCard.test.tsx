import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GiftCard } from './GiftCard';

describe('GiftCard', () => {
  const mockGift = {
    id: '1',
    person_id: '1',
    title: 'Test Gift',
    description: 'Test Description',
    is_selected: false,
    created_at: new Date().toISOString(),
  };

  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  it('should render gift title and description', () => {
    render(<GiftCard gift={mockGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    expect(screen.getByText('Test Gift')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should show select button when gift is not selected', () => {
    render(<GiftCard gift={mockGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    expect(screen.getByText(/Select as Final Gift/i)).toBeInTheDocument();
  });

  it('should not show select button when gift is selected', () => {
    const selectedGift = { ...mockGift, is_selected: true };
    render(<GiftCard gift={selectedGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    expect(screen.queryByText(/Select as Final Gift/i)).not.toBeInTheDocument();
  });

  it('should show star icon when gift is selected', () => {
    const selectedGift = { ...mockGift, is_selected: true };
    render(<GiftCard gift={selectedGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('should call onSelect when select button is clicked', () => {
    render(<GiftCard gift={mockGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    const selectButton = screen.getByText(/Select as Final Gift/i);
    selectButton.click();

    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<GiftCard gift={mockGift} onDelete={mockOnDelete} onSelect={mockOnSelect} />);

    const deleteButton = screen.getByLabelText('Delete Test Gift');
    deleteButton.click();

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});
