/**
 * String utility functions
 * Pure functions with no dependencies
 */
export class StringUtil {
    /**
     * Convert string to slug (URL-friendly)
     */
    static toSlug(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Truncate string to specified length
     */
    static truncate(text: string, length: number, suffix = '...'): string {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    }

    /**
     * Capitalize first letter
     */
    static capitalize(text: string): string {
        if (!text) return text;
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    /**
     * Generate random string
     */
    static random(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Mask sensitive data (e.g., email, phone)
     */
    static mask(text: string, visibleChars = 4, maskChar = '*'): string {
        if (text.length <= visibleChars) return text;
        const visible = text.slice(-visibleChars);
        const masked = maskChar.repeat(text.length - visibleChars);
        return masked + visible;
    }
}
