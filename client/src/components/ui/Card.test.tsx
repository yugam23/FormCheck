import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

describe('Card Components', () => {
    it('Card renders children and classes correctly', () => {
        render(<Card className="custom-class">Content</Card>);
        const card = screen.getByText('Content');
        expect(card).toHaveClass('glass-panel');
        expect(card).toHaveClass('custom-class');
    });

    it('CardHeader renders correctly', () => {
        render(<CardHeader>Header Content</CardHeader>);
        expect(screen.getByText('Header Content')).toHaveClass('flex-col');
    });

    it('CardTitle renders as h3', () => {
        render(<CardTitle>Title</CardTitle>);
        const title = screen.getByText('Title');
        expect(title.tagName).toBe('H3');
        expect(title).toHaveClass('font-bold');
    });

    it('CardContent renders correctly', () => {
        render(<CardContent>Body Content</CardContent>);
        expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('Card applies hover effect via props', () => {
        render(<Card hoverEffect data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card.className).toContain('hover:border-primary/30');
    });
});
