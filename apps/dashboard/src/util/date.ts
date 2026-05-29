export const parseSafeDate = (val: any): Date => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    if (typeof val === 'number') return new Date(val);

    const str = String(val).trim();
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    // Try Laravel/ISO format cleanup
    const formatted = str.replace(/\//g, '-').replace(' ', 'T');
    const d2 = new Date(formatted);
    if (!isNaN(d2.getTime())) return d2;

    // Try as UTC
    if (formatted.length > 10 && !formatted.includes('Z') && !formatted.includes('+')) {
        const d3 = new Date(formatted + 'Z');
        if (!isNaN(d3.getTime())) return d3;
    }

    return new Date();
};

export const formatDMY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
};

export const formatDate = (date: Date, format: "yyyy-MM-dd" | "PPP" | "LLL dd, y" = "yyyy-MM-dd"): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
        case "yyyy-MM-dd":
            return `${year}-${month}-${day}`;
        case "PPP":
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case "LLL dd, y":
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        default:
            return `${year}-${month}-${day}`;
    }
};
export const subtractDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

export const timeAgo = (dateInput: Date | string | number, locale: string = 'en'): string => {
    const date = dateInput instanceof Date ? dateInput : parseSafeDate(dateInput);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const seconds = Math.floor(diffInMs / 1000);

    const absSeconds = Math.abs(seconds);

    if (absSeconds < 60) return locale === 'ar' ? 'الآن' : 'Just now';

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    const labels: { [key: string]: { en: string; ar: string } } = {
        year: { en: 'year', ar: 'سنة' },
        month: { en: 'month', ar: 'شهر' },
        week: { en: 'week', ar: 'أسبوع' },
        day: { en: 'day', ar: 'يوم' },
        hour: { en: 'hour', ar: 'ساعة' },
        minute: { en: 'minute', ar: 'دقيقة' },
    };

    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(absSeconds / value);
        if (count >= 1) {
            if (locale === 'ar') {
                return `منذ ${count} ${labels[key].ar}`;
            }
            return `${count} ${labels[key].en}${count > 1 ? 's' : ''} ago`;
        }
    }

    return locale === 'ar' ? 'الآن' : 'Just now';
};