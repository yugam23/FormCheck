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
