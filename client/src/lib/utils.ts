// utils.ts
//
// General utility functions for the FormCheck client.
//
// cn() - Tailwind CSS class merging utility:
//   Combines clsx (conditional class joining) with tailwind-merge
//   (conflict resolution). Essential for component APIs that accept
//   className props—prevents duplicate/conflicting Tailwind classes.
//
// Example conflict resolution:
//   cn('px-4', 'px-6') -> 'px-6' (not 'px-4 px-6')

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx, resolving conflicts.
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-primary', className)
 * // Returns: "px-4 py-2 bg-primary custom-class"
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
