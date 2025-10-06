import { addDays } from 'date-fns';

// Anchor date for week calculation, set to a Sunday. Calibrated for program start date Oct 6, 2024.
const ACADEMY_START_DATE = new Date(Date.UTC(2024, 9, 6)); // Sunday, Oct 6, 2024

/**
 * Calculates the academy week number based on a fixed anchor date.
 * This ensures the week number is consistent regardless of client timezone.
 * @param d The current date.
 * @returns The academy-specific week number.
 */
export const getWeekNumber = (d: Date): number => {
    const currentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    
    // Calculate the difference in days from the start date.
    const diffTime = currentDate.getTime() - ACADEMY_START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // The week number is 1 (for the first week) + the number of full weeks that have passed.
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return weekNumber;
};

/**
 * Calculates the start date (Sunday) for a given academy week number.
 * @param weekNumber The academy week number.
 * @returns The start date of that week.
 */
export const getStartDateOfWeek = (weekNumber: number): Date => {
    const daysOffset = (weekNumber - 1) * 7;
    return addDays(ACADEMY_START_DATE, daysOffset);
};