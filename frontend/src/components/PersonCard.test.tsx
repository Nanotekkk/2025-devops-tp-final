import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonCard } from './PersonCard';

describe('PersonCard', () => {
  const mockPerson = {
    id: '1',
    name: 'Santa Claus',
    created_at: new Date().toISOString(),
  };

  const mockOnDelete = vi.fn();

  it('should render person name', () => {
    render(<PersonCard person={mockPerson} onDelete={mockOnDelete} />);

    expect(screen.getByText('Santa Claus')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<PersonCard person={mockPerson} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByLabelText('Delete Santa Claus');
    deleteButton.click();

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should have a link to view gifts', () => {
    render(<PersonCard person={mockPerson} onDelete={mockOnDelete} />);

    const viewGiftsButton = screen.getByText(/View Gifts/i);
    expect(viewGiftsButton).toBeInTheDocument();
  });
});
