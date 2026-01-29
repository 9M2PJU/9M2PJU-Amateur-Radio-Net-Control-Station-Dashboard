import { format } from 'date-fns'

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug for a net based on name and date
 */
export function generateNetSlug(name: string, date: Date = new Date()): string {
    const nameSlug = slugify(name)
    const dateSlug = format(date, 'yyyy-MM-dd')
    return `${nameSlug}-${dateSlug}`
}
