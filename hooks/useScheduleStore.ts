import { create } from 'zustand';
import type { Assignment } from '../types';
import { processedScheduleData } from '../data/scheduleData';

type ScheduleState = {
    assignments: Assignment[];
    getAssignments: () => Assignment[];
};

const useScheduleStore = create<ScheduleState>((set, get) => ({
    assignments: processedScheduleData,
    getAssignments: () => get().assignments,
}));

export default useScheduleStore;
