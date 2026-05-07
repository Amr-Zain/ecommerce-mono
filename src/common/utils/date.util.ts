/**
 * Date utility functions
 * Pure functions with no dependencies
 */
export class DateUtil {
    /**
     * Format date to ISO string
     */
    static toISOString(date: Date): string {
        return date.toISOString();
    }

    /**
     * Format date to YYYY-MM-DD
     */
    static toDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format date to DD/MM/YYYY (default) or MM/DD/YYYY based on locale
     */
    static toLocaleDateString(date: Date, locale = 'en-GB'): string {
        return date.toLocaleDateString(locale);
    }

    /**
     * Format date to HH:MM:SS
     */
    static toTimeString(date: Date): string {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Format date to YYYY-MM-DD HH:MM:SS
     */
    static toDateTimeString(date: Date): string {
        return `${this.toDateString(date)} ${this.toTimeString(date)}`;
    }

    /**
     * Format date with locale support
     * @param date - Date to format
     * @param locale - Locale code (e.g., 'en-US', 'ar-SA', 'en-GB')
     * @param options - Intl.DateTimeFormatOptions
     */
    static formatWithLocale(
        date: Date,
        locale = 'en-US',
        options?: Intl.DateTimeFormatOptions,
    ): string {
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    /**
     * Format date for Arabic locale
     * Example: "٢٠٢٦/٥/٧" or "٧ مايو ٢٠٢٦"
     */
    static formatArabic(date: Date, style: 'short' | 'long' = 'short'): string {
        if (style === 'long') {
            return this.formatWithLocale(date, 'ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return this.formatWithLocale(date, 'ar-SA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    }

    /**
     * Format date for English locale
     * Example: "5/7/2026" or "May 7, 2026"
     */
    static formatEnglish(date: Date, style: 'short' | 'long' = 'short'): string {
        if (style === 'long') {
            return this.formatWithLocale(date, 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return this.formatWithLocale(date, 'en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
    }

    /**
     * Format date based on language code
     * @param date - Date to format
     * @param lang - Language code ('en' or 'ar')
     * @param style - Format style ('short' or 'long')
     */
    static formatByLang(
        date: Date,
        lang: 'en' | 'ar',
        style: 'short' | 'long' = 'short',
    ): string {
        if (lang === 'ar') {
            return this.formatArabic(date, style);
        }
        return this.formatEnglish(date, style);
    }

    /**
     * Format date with custom format
     * Supported tokens: YYYY, MM, DD, HH, mm, ss
     * Example: format(date, 'YYYY-MM-DD HH:mm:ss')
     */
    static format(date: Date, formatStr: string): string {
        const tokens: Record<string, string> = {
            YYYY: String(date.getFullYear()),
            MM: String(date.getMonth() + 1).padStart(2, '0'),
            DD: String(date.getDate()).padStart(2, '0'),
            HH: String(date.getHours()).padStart(2, '0'),
            mm: String(date.getMinutes()).padStart(2, '0'),
            ss: String(date.getSeconds()).padStart(2, '0'),
        };

        return formatStr.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => tokens[match]);
    }

    /**
     * Add days to a date
     */
    static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Add hours to a date
     */
    static addHours(date: Date, hours: number): Date {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }

    /**
     * Add minutes to a date
     */
    static addMinutes(date: Date, minutes: number): Date {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    /**
     * Add months to a date
     */
    static addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    /**
     * Add years to a date
     */
    static addYears(date: Date, years: number): Date {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    /**
     * Subtract days from a date
     */
    static subtractDays(date: Date, days: number): Date {
        return this.addDays(date, -days);
    }

    /**
     * Subtract hours from a date
     */
    static subtractHours(date: Date, hours: number): Date {
        return this.addHours(date, -hours);
    }

    /**
     * Subtract minutes from a date
     */
    static subtractMinutes(date: Date, minutes: number): Date {
        return this.addMinutes(date, -minutes);
    }

    /**
     * Check if date is in the past
     */
    static isPast(date: Date): boolean {
        return date < new Date();
    }

    /**
     * Check if date is in the future
     */
    static isFuture(date: Date): boolean {
        return date > new Date();
    }

    /**
     * Check if date is today
     */
    static isToday(date: Date): boolean {
        const today = new Date();
        return this.toDateString(date) === this.toDateString(today);
    }

    /**
     * Check if date is yesterday
     */
    static isYesterday(date: Date): boolean {
        const yesterday = this.subtractDays(new Date(), 1);
        return this.toDateString(date) === this.toDateString(yesterday);
    }

    /**
     * Check if date is tomorrow
     */
    static isTomorrow(date: Date): boolean {
        const tomorrow = this.addDays(new Date(), 1);
        return this.toDateString(date) === this.toDateString(tomorrow);
    }

    /**
     * Get difference in days between two dates
     */
    static diffInDays(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Get difference in hours between two dates
     */
    static diffInHours(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60));
    }

    /**
     * Get difference in minutes between two dates
     */
    static diffInMinutes(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60));
    }

    /**
     * Get difference in seconds between two dates
     */
    static diffInSeconds(date1: Date, date2: Date): number {
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / 1000);
    }

    /**
     * Get start of day (00:00:00)
     */
    static startOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get end of day (23:59:59)
     */
    static endOfDay(date: Date): Date {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }

    /**
     * Get start of month
     */
    static startOfMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    /**
     * Get end of month
     */
    static endOfMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    /**
     * Get start of year
     */
    static startOfYear(date: Date): Date {
        return new Date(date.getFullYear(), 0, 1);
    }

    /**
     * Get end of year
     */
    static endOfYear(date: Date): Date {
        return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    /**
     * Check if two dates are the same day
     */
    static isSameDay(date1: Date, date2: Date): boolean {
        return this.toDateString(date1) === this.toDateString(date2);
    }

    /**
     * Check if date is between two dates
     */
    static isBetween(date: Date, start: Date, end: Date): boolean {
        return date >= start && date <= end;
    }

    /**
     * Get relative time string with locale support
     * @param date - Date to format
     * @param lang - Language code ('en' or 'ar')
     * Example EN: "2 hours ago", "in 3 days"
     * Example AR: "منذ ساعتين", "خلال 3 أيام"
     */
    static getRelativeTime(date: Date, lang: 'en' | 'ar' = 'en'): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(Math.abs(diffMs) / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        const isPast = diffMs > 0;

        if (lang === 'ar') {
            if (diffSec < 60) {
                return isPast ? 'الآن' : 'الآن';
            } else if (diffMin < 60) {
                return isPast
                    ? `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : diffMin === 2 ? 'دقيقتين' : 'دقائق'}`
                    : `خلال ${diffMin} ${diffMin === 1 ? 'دقيقة' : diffMin === 2 ? 'دقيقتين' : 'دقائق'}`;
            } else if (diffHour < 24) {
                return isPast
                    ? `منذ ${diffHour} ${diffHour === 1 ? 'ساعة' : diffHour === 2 ? 'ساعتين' : 'ساعات'}`
                    : `خلال ${diffHour} ${diffHour === 1 ? 'ساعة' : diffHour === 2 ? 'ساعتين' : 'ساعات'}`;
            } else if (diffDay < 30) {
                return isPast
                    ? `منذ ${diffDay} ${diffDay === 1 ? 'يوم' : diffDay === 2 ? 'يومين' : 'أيام'}`
                    : `خلال ${diffDay} ${diffDay === 1 ? 'يوم' : diffDay === 2 ? 'يومين' : 'أيام'}`;
            } else if (diffMonth < 12) {
                return isPast
                    ? `منذ ${diffMonth} ${diffMonth === 1 ? 'شهر' : diffMonth === 2 ? 'شهرين' : 'أشهر'}`
                    : `خلال ${diffMonth} ${diffMonth === 1 ? 'شهر' : diffMonth === 2 ? 'شهرين' : 'أشهر'}`;
            } else {
                return isPast
                    ? `منذ ${diffYear} ${diffYear === 1 ? 'سنة' : diffYear === 2 ? 'سنتين' : 'سنوات'}`
                    : `خلال ${diffYear} ${diffYear === 1 ? 'سنة' : diffYear === 2 ? 'سنتين' : 'سنوات'}`;
            }
        }

        // English
        if (diffSec < 60) {
            return isPast ? 'just now' : 'in a moment';
        } else if (diffMin < 60) {
            return isPast
                ? `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
                : `in ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
        } else if (diffHour < 24) {
            return isPast
                ? `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
                : `in ${diffHour} hour${diffHour > 1 ? 's' : ''}`;
        } else if (diffDay < 30) {
            return isPast
                ? `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
                : `in ${diffDay} day${diffDay > 1 ? 's' : ''}`;
        } else if (diffMonth < 12) {
            return isPast
                ? `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
                : `in ${diffMonth} month${diffMonth > 1 ? 's' : ''}`;
        } else {
            return isPast
                ? `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
                : `in ${diffYear} year${diffYear > 1 ? 's' : ''}`;
        }
    }

    /**
     * Parse date from string (YYYY-MM-DD or ISO format)
     */
    static parse(dateStr: string): Date {
        return new Date(dateStr);
    }

    /**
     * Check if string is valid date
     */
    static isValid(dateStr: string): boolean {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }

    /**
     * Get age from birthdate
     */
    static getAge(birthdate: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Get day name with locale support
     * @param date - Date to get day name from
     * @param lang - Language code ('en' or 'ar')
     * Example EN: "Monday", "Tuesday"
     * Example AR: "الاثنين", "الثلاثاء"
     */
    static getDayName(date: Date, lang: 'en' | 'ar' = 'en'): string {
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        return date.toLocaleDateString(locale, { weekday: 'long' });
    }

    /**
     * Get month name with locale support
     * @param date - Date to get month name from
     * @param lang - Language code ('en' or 'ar')
     * Example EN: "January", "February"
     * Example AR: "يناير", "فبراير"
     */
    static getMonthName(date: Date, lang: 'en' | 'ar' = 'en'): string {
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        return date.toLocaleDateString(locale, { month: 'long' });
    }

    /**
     * Get quarter of year (1-4)
     */
    static getQuarter(date: Date): number {
        return Math.floor(date.getMonth() / 3) + 1;
    }

    /**
     * Get week number of year
     */
    static getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = this.diffInDays(firstDayOfYear, date);
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
}
