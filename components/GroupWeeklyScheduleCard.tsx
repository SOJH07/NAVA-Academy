import React from 'react';
import type { DailyPeriod, Assignment, GroupInfo } from '../types';
import useBulletinsStore from '../store/bulletinsStore';
import { isSameDay } from 'date-fns';

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

interface GroupWeeklyScheduleCardProps {
  selection: { type: 'group' | 'room', value: string };
  allAssignments: Assignment[];
  currentPeriodName: string | null;
  today: Assignment['day'];
}

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const scheduleCodeToId = (code: string): string => {
    return code.replace('0.', '').replace('.', '');
};

const schematicNameToId = (name: string): string => {
    const match = name.match(/(C|LAP|L|WS)-?\s?(\d+)/i);
    if (!match) return name.replace(/[^a-z0-9]/gi, ''); 
    const prefix = match[1].toUpperCase();
    const number = match[2];
    if (prefix === 'WS') {
        return `WS${parseInt(number, 10)}`;
    }
    const numericPart = parseInt(number, 10);
    if (numericPart > 100) return String(numericPart);
    return number;
};


const SessionCard: React.FC<{ assignment: Assignment, isLive: boolean, viewType: 'group' | 'room' }> = ({ assignment, isLive, viewType }) => {
    const isPractical = assignment.classroom.startsWith('1.') || assignment.classroom.startsWith('WS-') || assignment.classroom.startsWith('0.');
    const locationName = assignment.classroom.startsWith('WS-') ? assignment.classroom : `C-${assignment.classroom.replace('.', '')}`;
    
    let colorClass = 'bg-emerald-100/50 border-emerald-400 text-emerald-800'; // Classroom default
    if (isPractical) {
        if (locationName.startsWith('WS')) {
            colorClass = 'bg-amber-100/50 border-amber-400 text-amber-800'; // Workshop
        } else {
             colorClass = 'bg-violet-100/50 border-violet-400 text-violet-800'; // Lab
        }
    }

    const mainText = viewType === 'group' ? locationName : assignment.group;
    const subText = viewType === 'group' ? assignment.topic : assignment.instructors.join(', ');


    return (
        <div className={`relative p-2 rounded-lg h-full flex flex-col justify-between transition-all border-l-4 ${isLive ? 'ring-2 ring-nava-gold' : ''} ${colorClass}`}>
            <div>
                 <p className="font-bold text-xs">{mainText}</p>
                 <p className="font-semibold text-xs text-text-primary line-clamp-3">{subText}</p>
            </div>
            <p className="text-[11px] text-text-muted">{viewType === 'group' ? assignment.instructors.join(', ') : assignment.topic}</p>
        </div>
    );
};

const GroupWeeklyScheduleCard: React.FC<GroupWeeklyScheduleCardProps> = ({ selection, allAssignments, currentPeriodName, today }) => {
    const { bulletins } = useBulletinsStore();

    const groupToShow = React.useMemo(() => {
        if (!selection) return null;
        if (selection.type === 'group') {
            return selection.value;
        }
        if (selection.type === 'room' && currentPeriodName) {
            const selectedRoomId = schematicNameToId(selection.value);
            const assignmentInRoom = allAssignments.find(a => 
                a.day === today &&
                a.period === currentPeriodName &&
                (schematicNameToId(a.classroom) === selectedRoomId || schematicNameToId(a.classroom).replace(/^c/, '') === selectedRoomId.replace(/^c/, ''))
            );
            return assignmentInRoom?.group ?? null;
        }
        return null;

    }, [selection, allAssignments, currentPeriodName, today]);


    const assignmentsForSelection = React.useMemo(() => {
        if (!groupToShow) return [];
        return allAssignments.filter(a => a.group === groupToShow);
    }, [allAssignments, groupToShow]);
    
    const assignmentsByDayAndPeriod = React.useMemo(() => {
        const assignmentsByGroup: { [day: string]: Assignment[] } = {};
        DAYS.forEach(day => {
            assignmentsByGroup[day] = assignmentsForSelection.filter(a => a.day === day)
                .sort((a, b) => parseInt(a.period.substring(1)) - parseInt(b.period.substring(1)));
        });

        const blocks: (Assignment & { span: number; startPeriod: number; })[] = [];
        const processedIds = new Set<number>();
        
        DAYS.forEach(day => {
            const dayAssignments = assignmentsByGroup[day];
            for (const assignment of dayAssignments) {
                if (processedIds.has(assignment.id)) continue;

                let span = 1;
                processedIds.add(assignment.id);
                
                let currentPeriodNum = parseInt(assignment.period.substring(1));
                for (let i = dayAssignments.indexOf(assignment) + 1; i < dayAssignments.length; i++) {
                    const nextAssignment = dayAssignments[i];
                    const nextPeriodNum = parseInt(nextAssignment.period.substring(1));
                    if (nextPeriodNum === currentPeriodNum + 1 && nextAssignment.topic === assignment.topic && nextAssignment.instructors.join(',') === assignment.instructors.join(',')) {
                        span++;
                        currentPeriodNum++;
                        processedIds.add(nextAssignment.id);
                    }
                    else {
                        break;
                    }
                }
                blocks.push({ ...assignment, span, startPeriod: parseInt(assignment.period.substring(1)) });
            }
        });
        return blocks;
    }, [assignmentsForSelection]);
  
    const dayOverlays = React.useMemo(() => {
        if (!groupToShow) return {};
        const overlays: Record<string, any[]> = {};
        const todayDate = new Date();
        const startOfWeek = new Date(todayDate.setDate(todayDate.getDate() - todayDate.getDay()));

        DAYS.forEach((day, dayIndex) => {
            const dateForDay = new Date(startOfWeek.getTime());
            dateForDay.setDate(startOfWeek.getDate() + dayIndex);
            
            overlays[day] = bulletins.filter(b => {
                const audience = b.audience;
                const groupMatch = audience && typeof audience === 'object' && 'groups' in audience && audience.groups?.includes(groupToShow);
                return (b.type === 'visit' || b.type === 'event') && 
                    b.date && isSameDay(new Date(b.date), dateForDay) &&
                    b.timeStart && b.timeEnd && groupMatch;
            });
        });
        return overlays;
    }, [bulletins, groupToShow]);

  const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
  
  if (assignmentsForSelection.length === 0) {
      return (
          <div className="flex items-center justify-center h-full text-center text-kiosk-text-muted">
              <div>
                  <h3 className="font-bold text-lg">No Schedule Information</h3>
                  <p className="text-sm mt-1">There are no assignments for this {selection.type} this week, or the room is currently empty.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full p-1">
      <div className="grid grid-cols-[auto_repeat(5,1fr)] grid-rows-[auto_repeat(7,1fr)] gap-1 h-full">
        <div className="row-start-1 col-start-1"></div>
        {DAYS.map((day, index) => (
            <div key={day} className={`relative text-center font-montserrat font-semibold text-sm pb-1 row-start-1 col-start-${index + 2} ${day === today ? 'text-nava-gold' : 'text-text-secondary'}`}>
                {day}
            </div>
        ))}

        {PERIODS.map((period, index) => (
            <div key={period} className={`row-start-${index + 2} col-start-1 text-right pr-2 font-montserrat font-semibold text-sm text-text-muted flex items-center justify-end`}>
                {period}
            </div>
        ))}
        
        {DAYS.map((day, dayIndex) => (
            <div key={`overlay-col-${day}`} className="relative pointer-events-none" style={{ gridColumnStart: dayIndex + 2, gridRow: '2 / span 7' }}>
                {(dayOverlays[day] || []).map(event => {
                    const dayStartMinutes = timeToMinutes('08:00');
                    const dayEndMinutes = timeToMinutes('15:40');
                    const totalDayMinutes = dayEndMinutes - dayStartMinutes;
                    if(totalDayMinutes <= 0) return null;

                    const eventStartMinutes = timeToMinutes(event.timeStart!);
                    const eventEndMinutes = timeToMinutes(event.timeEnd!);

                    const topPercent = Math.max(0, ((eventStartMinutes - dayStartMinutes) / totalDayMinutes) * 100);
                    const heightPercent = Math.min(100 - topPercent, ((eventEndMinutes - eventStartMinutes) / totalDayMinutes) * 100);

                    return (
                        <div key={event.id} className="absolute inset-x-0 z-0" style={{ top: `${topPercent}%`, height: `${heightPercent}%`}}>
                            <div className={`h-full rounded-lg bg-gradient-to-b from-${event.accent}-400/20 to-transparent p-1`}>
                                <div className={`px-2 py-0.5 text-xs font-bold rounded-full bg-${event.accent}-500 text-white w-max`}>{event.title}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        ))}

        {assignmentsByDayAndPeriod.map(block => {
             const dayIndex = DAYS.indexOf(block.day);
             if (dayIndex === -1) return null;
             const isLive = block.day === today && currentPeriodName && parseInt(currentPeriodName.substring(1)) >= block.startPeriod && parseInt(currentPeriodName.substring(1)) < block.startPeriod + block.span;

             return (
                <div 
                    key={block.id}
                    className="p-0.5 z-10"
                    style={{
                        gridColumnStart: dayIndex + 2,
                        gridRow: `${block.startPeriod + 1} / span ${block.span}`
                    }}
                >
                    <SessionCard assignment={block} isLive={isLive} viewType={selection.type} />
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default GroupWeeklyScheduleCard;
