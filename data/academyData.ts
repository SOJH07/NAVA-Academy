import type { GroupInfo, FloorPlanItem, DailyPeriod, Student } from '../types';
import { studentsData } from './students';
import { dailyPeriodsData } from './dailyPeriods';
import { groupSchedulesData } from './groupSchedules';
import { curriculumData } from './curriculum';
import { allFloorLayouts as allLayouts } from './floorPlan';

// Re-exporting raw data
export const students: Student[] = studentsData;
export const dailySchedule: DailyPeriod[] = dailyPeriodsData;
export const floorPlanLayout: FloorPlanItem[] = allLayouts.second; // Keep for legacy compatibility
export const allFloorLayouts = allLayouts;

// Combining schedule and curriculum into groupInfo
const combinedGroupInfo: { [key:string]: { schedule_type?: string; curriculum_name?: string; track_name?: string; } } = {};

groupSchedulesData.forEach(schedule => {
    if (!combinedGroupInfo[schedule.group_name]) {
        combinedGroupInfo[schedule.group_name] = {};
    }
    combinedGroupInfo[schedule.group_name].schedule_type = schedule.schedule_type;
});

curriculumData.forEach(curriculum => {
    if (!combinedGroupInfo[curriculum.group_name]) {
        combinedGroupInfo[curriculum.group_name] = {};
    }
    combinedGroupInfo[curriculum.group_name].curriculum_name = curriculum.curriculum_name;
    combinedGroupInfo[curriculum.group_name].track_name = curriculum.track_name;
});

// Fill in missing properties to satisfy GroupInfo type
export const groupInfo: GroupInfo = {};
for (const groupName in combinedGroupInfo) {
    groupInfo[groupName] = {
        schedule_type: combinedGroupInfo[groupName].schedule_type || '',
        curriculum_name: combinedGroupInfo[groupName].curriculum_name || '',
        track_name: combinedGroupInfo[groupName].track_name || '',
    };
}
