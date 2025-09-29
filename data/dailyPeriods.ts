import type { DailyPeriod } from '../types';

export const dailyPeriodsData: DailyPeriod[] = [
    { name: 'P1', start: '08:00', end: '08:55', type: 'class' },
    { name: 'P2', start: '08:55', end: '09:50', type: 'class' },
    { name: 'Breakfast Break', start: '09:50', end: '10:10', type: 'break' },
    { name: 'P3', start: '10:10', end: '11:05', type: 'class' },
    { name: 'P4', start: '11:05', end: '12:00', type: 'class' },
    { name: 'Lunch/Prayer Break', start: '12:00', end: '12:45', type: 'break' },
    { name: 'P5', start: '12:45', end: '13:40', type: 'class' },
    { name: 'P6', start: '13:40', end: '14:35', type: 'class' },
    { name: 'Short Break', start: '14:35', end: '14:45', type: 'break' },
    { name: 'P7', start: '14:45', end: '15:40', type: 'class' },
];
