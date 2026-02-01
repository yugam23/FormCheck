import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { Check } from 'lucide-react';

describe('Button', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const btn = screen.getByRole('button', { name: /click me/i });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveClass('btn-primary');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders loading state correctly', () => {
        render(<Button loading>Loading</Button>);
        const btn = screen.getByRole('button');
        expect(btn).toBeDisabled();
        // Check if Loader2 (or spinner) is present? hard to query by icon usually, 
        // but text content 'Loading' should be there too
        expect(screen.getByText('Loading')).toBeInTheDocument();
        // Class check
        expect(btn).toHaveClass('cursor-wait');
    });

    it('renders icon when provided', () => {
        render(<Button icon={<span data-testid="icon">icon</span>}>With Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders variants correctly', () => {
        const { rerender } = render(<Button variant="danger">Danger</Button>);
        expect(screen.getByRole('button')).toHaveClass('bg-red-500');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toHaveClass('text-muted-foreground');
    });

    it('disabled prop takes precedence', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
