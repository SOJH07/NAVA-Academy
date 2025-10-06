import { useState, useEffect, useMemo } from 'react';
import type { AnalyzedStudent, DailyPeriod, GroupInfo, LiveStudent, OccupancyData, LiveClass, Assignment } from '../types';
import { getISOWeek } from 'date-fns';


const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const useLiveStatus = (
    analyzedStudents: AnalyzedStudent[],
    dailySchedule: DailyPeriod[],
    groupInfo: GroupInfo,
    scheduleAssignments: Assignment[],
    simulatedTime: number | null
) => {
    const [now, setNow] = useState(new Date(simulatedTime ?? Date.now()));

    useEffect(() => {
        let timerId: number;

        if (simulatedTime !== null) {
            const simulatedDate = new Date(simulatedTime);

            const updateToLiveTime = () => {
                const liveTime = new Date(); // The actual current time
                const combinedDate = new Date(
                    simulatedDate.getFullYear(),
                    simulatedDate.getMonth(),
                    simulatedDate.getDate(),
                    liveTime.getHours(),
                    liveTime.getMinutes(),
                    liveTime.getSeconds()
                );
                setNow(combinedDate);
            };
            
            updateToLiveTime();
            timerId = window.setInterval(updateToLiveTime, 1000);
        } else {
            // Fallback to fully live if no simulation is set at all.
            timerId = window.setInterval(() => setNow(new Date()), 1000);
        }

        return () => clearInterval(timerId);
    }, [simulatedTime]);

    const { saudiHour, saudiMinute, saudiDayName } = useMemo(() => {
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Riyadh',
            hour: 'numeric',
            minute: 'numeric',
            weekday: 'long',
            hour12: false,
        };
        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(now);

        const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value;
        
        const hourStr = getPart('hour');
        const hour = hourStr === '24' ? 0 : parseInt(hourStr || '0', 10);

        return {
            saudiHour: hour,
            saudiMinute: parseInt(getPart('minute') || '0', 10),
            saudiDayName: getPart('weekday') as Assignment['day'],
        };
    }, [now]);
    
    const weekNumber = useMemo(() => getISOWeek(now), [now]);
    const nowMinutes = useMemo(() => saudiHour * 60 + saudiMinute, [saudiHour, saudiMinute]);
    const today: Assignment['day'] = useMemo(() => saudiDayName, [saudiDayName]);


    const isOperationalHours = useMemo(() => {
        if (simulatedTime !== null) return true; // Always treat simulated time as operational for viewing past/future states
        const isWeekday = today !== 'Friday' && today !== 'Saturday';
        if (!isWeekday || dailySchedule.length === 0) return false;
        
        const firstPeriodStart = timeToMinutes(dailySchedule[0].start);
        const lastPeriodEnd = timeToMinutes(dailySchedule[dailySchedule.length - 1].end);

        return nowMinutes >= firstPeriodStart && nowMinutes < lastPeriodEnd;
    }, [today, nowMinutes, dailySchedule, simulatedTime]);

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
                let trackType: LiveClass['trackType'] = 'professional';
                if (assignment.type === 'Technical') {
                    trackType = trackName === 'Industrial Tech' ? 'industrial' : 'service';
                }
                
                // Heuristic to determine session type based on location
                const sessionType: LiveClass['sessionType'] = 
                    assignment.classroom.startsWith('2.') || assignment.classroom.startsWith('3.') 
                    ? 'theory' : 'practical';

                if (!addedGroups.has(assignment.group)) {
                    liveClasses.push({
                        group: assignment.group,
                        trackType: trackType,
                        classroom: assignment.classroom,
                        instructors: assignment.instructors,
                        sessionType: sessionType,
                        topic: assignment.topic
                    });
                    addedGroups.add(assignment.group);
                }
                
                occupancy[assignment.classroom] = {
                    group: assignment.group,
                    trackType: trackType,
                    instructors: assignment.instructors,
                    sessionType: sessionType,
                    topic: assignment.topic,
                };
            }
        }
        
        liveClasses.sort((a,b) => a.group.localeCompare(b.group));

        return { occupancy, liveClasses, liveStudents };

    }, [analyzedStudents, nowMinutes, currentPeriod, today, dailySchedule, scheduleAssignments, groupInfo]);

    return { now, weekNumber, currentPeriod, ...liveData, overallStatus, isOperationalHours };
};