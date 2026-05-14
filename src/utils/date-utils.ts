export const toDateInputValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDateInputValue = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Parse une date au format "DD/MM/YYYY" → Date
 */
export function parseStringCsvToDate(raw: string): Date {
    const [day, month, year] = raw.trim().split('/').map(Number);
    return new Date(year, month - 1, day);
}

export function parseDateToString(date: Date): string {
    return `${toDateInputValue(date)} 00:00:00`
}