import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/render';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the default title when no props are provided', () => {
    render(<EmptyState />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<EmptyState title="No festivals found" />);
    expect(screen.getByText('No festivals found')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    render(<EmptyState description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('does not render a description element when description is omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/try adjusting/i)).not.toBeInTheDocument();
  });
});
