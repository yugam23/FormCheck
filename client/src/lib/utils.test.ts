import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
        const isTrue = true;
        const isFalse = false;
        expect(cn('class1', isFalse && 'class2', isTrue && 'class3')).toBe('class1 class3');
        expect(cn('class1', undefined, null)).toBe('class1');
    });

    it('merges Tailwind conflicts', () => {
        // twMerge should handle conflicting tailwind classes
        // Last one wins
        expect(cn('p-4', 'p-8')).toBe('p-8');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles arrays and objects', () => {
        expect(cn(['class1', 'class2'])).toBe('class1 class2');
        expect(cn({ class1: true, class2: false })).toBe('class1');
    });
});
