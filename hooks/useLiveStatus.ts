import { useState, useEffect, useMemo } from 'react';
import type { AnalyzedStudent, DailyPeriod, GroupInfo, LiveStudent, OccupancyData, LiveClass, Assignment } from '../types';

/**
 * Calculates the academy week number based on a fixed anchor date.
 * This ensures the week number is consistent regardless of client timezone.
 * @param d The current date.
 * @returns The academy-specific week number.
 */
const getWeekNumber = (d: Date): number => {
    // Anchor date for week calculation, set to a Sunday. Calibrated so that Sep 7, 2025 is in Week 43.
    const academyStartDate = new Date(Date.UTC(2024, 10, 17)); // November is month 10 (0-indexed)
    const currentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

    // If the current date is before the start date, default to Week 1.
    if (currentDate < academyStartDate) {
        return 1;
    }
    
    // Calculate the difference in days from the start date.
    const diffTime = currentDate.getTime() - academyStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // The week number is 1 (for the first week) + the number of full weeks that have passed.
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return weekNumber;
};


const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const useLiveStatus = (
    analyzedStudents: AnalyzedStudent[],
    dailySchedule: DailyPeriod[],
    groupInfo: GroupInfo,
    scheduleAssignments: Assignment[]
) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setNow(new Date()), 1000); // Update every second for live timer
        return () => clearInterval(timerId);
    }, []);

    const weekNumber = useMemo(() => getWeekNumber(now), [now]);
    const nowMinutes = useMemo(() => now.getHours() * 60 + now.getMinutes(), [now]);
    const today: Assignment['day'] = useMemo(() => DAYS[now.getDay()], [now]);

    const currentPeriod = useMemo<DailyPeriod | null>(() => {
        return dailySchedule.find(p => {
            const startMinutes = timeToMinutes(p.start);
            const endMinutes = timeToMinutes(p.end);
            return nowMinutes >= startMinutes && nowMinutes < endMinutes;
        }) || null;
    }, [nowMinutes, dailySchedule]);

    const overallStatus = useMemo<string>(() => {
        if (!currentPeriod) {
            if (dailySchedule.length > 0 && nowMinutes < timeToMinutes(dailySchedule[0].start)) {
                return 'Upcoming';
            }
            return 'Finished';
        }
        if (currentPeriod.type === 'class') {
            return 'In Class';
        }
        return currentPeriod.name; // 'Break' or 'Lunch'
    }, [currentPeriod, nowMinutes, dailySchedule]);

    const liveData = useMemo(() => {
        const occupancy: OccupancyData = {};
        const liveStudents: LiveStudent[] = [];
        
        const assignmentMap = new Map<string, Assignment>();
        if (currentPeriod && today !== 'Friday' && today !== 'Saturday') {
            scheduleAssignments
                .filter(a => a.day === today && a.period === currentPeriod.name)
                .forEach(a => {
                    assignmentMap.set(a.group, a);
                });
        }
        
        const firstPeriodStart = dailySchedule.length > 0 ? timeToMinutes(dailySchedule[0].start) : 0;
        const isUpcoming = nowMinutes < firstPeriodStart;
        const upcomingStatus: LiveStudent['status'] = 'Upcoming';
        
        if (!currentPeriod && isUpcoming) {
            for (const student of analyzedStudents) {
                liveStudents.push({ ...student, location: 'Not started', status: upcomingStatus, currentPeriod: 'N/A' });
            }
            return { occupancy, liveClasses: [], liveStudents };
        }

        // During or after school day
        for (const student of analyzedStudents) {
            let location = 'N/A';
            let status: LiveStudent['status'] = 'Finished';
            let periodName = currentPeriod?.name || 'N/A';
            
            if (currentPeriod) {
                if (currentPeriod.type === 'break') {
                    location = 'On Break';
                    status = 'Break';
                } else { // It's a class period.
                    status = 'In Class';
                    const group = student.techGroup;
                    const assignment = assignmentMap.get(group);
                    
                    if (assignment) {
                        const classroom = assignment.classroom;
                        if (classroom.startsWith('1.')) {
                            location = `Lab: C-${classroom.replace('.', '')}`;
                        } else if (classroom.startsWith('2.')) {
                            location = `Classroom: C-${classroom.replace('.', '')}`;
                        } else if (classroom.startsWith('WS-')) {
                            location = `Workshop: ${classroom}`;
                        } else {
                            location = `Classroom: ${classroom}`;
                        }
                    } else {
                        location = 'Unscheduled';
                    }
                }
            }
            
            liveStudents.push({ ...student, location, status, currentPeriod: periodName });
        }

        const liveClasses: LiveClass[] = [];
        if (currentPeriod && currentPeriod.type === 'class') {
            const activeAssignments = scheduleAssignments.filter(a => a.day === today && a.period === currentPeriod.name);
            const addedGroups = new Set<string>();

            for (const assignment of activeAssignments) {
                const trackName = groupInfo[assignment.group]?.track_name;
                let sessionType: LiveClass['type'] = 'professional';
                if (assignment.type === 'Technical') {
                    sessionType = trackName === 'Industrial Tech' ? 'industrial' : 'service';
                }

                if (!addedGroups.has(assignment.group)) {
                    liveClasses.push({
                        group: assignment.group,
                        type: sessionType,
                        classroom: assignment.classroom
                    });
                    addedGroups.add(assignment.group);
                }
                
                occupancy[assignment.classroom] = {
                    group: assignment.group,
                    type: sessionType,
                };
            }
        }
        
        liveClasses.sort((a,b) => a.group.localeCompare(b.group));

        return { occupancy, liveClasses, liveStudents };

    }, [analyzedStudents, nowMinutes, currentPeriod, today, dailySchedule, scheduleAssignments, groupInfo]);

    return { now, weekNumber, currentPeriod, ...liveData, overallStatus };
};