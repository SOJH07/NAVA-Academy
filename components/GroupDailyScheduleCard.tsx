import React, { useState, useEffect } from 'react';
import type { DailyPeriod, Assignment, GroupInfo } from '../types';
import { isSameDay } from 'date-fns';

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

// --- ICONS ---
const ClassroomIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const LabIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.5 3a.5.5 0 00-.5.5v2.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-.5z" clipRule="evenodd" /></svg>;
const WorkshopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const UserIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;


interface GroupWeeklyScheduleCardProps {
  selection: { type: 'group' | 'room', value: string };
  allAssignments: Assignment[];
  currentPeriodName: string | null;
  today: Assignment['day'];
  language: 'en' | 'ar';
}

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
    const locationName = assignment.classroom.startsWith('WS-') ? assignment.classroom.replace('WS-0.','WS-') : `C-${assignment.classroom.replace('.', '')}`;
    
    let borderColorClass = 'border-emerald-400';
    let locationColorClass = 'bg-emerald-100 text-emerald-800';
    let LocationIconComponent = <ClassroomIcon className="h-4 w-4" />;
    
    if (isPractical) {
        if (locationName.startsWith('WS')) {
            borderColorClass = 'border-amber-400';
            locationColorClass = 'bg-amber-100 text-amber-800';
            LocationIconComponent = <WorkshopIcon className="h-4 w-4" />;
        } else {
            borderColorClass = 'border-violet-400';
            locationColorClass = 'bg-violet-100 text-violet-800';
            LocationIconComponent = <LabIcon className="h-4 w-4" />;
        }
    }

    const mainText = viewType === 'group' ? locationName : assignment.group;

    return (
        <div className={`relative p-2 rounded-xl h-full flex flex-col justify-between transition-all bg-white border-l-4 ${borderColorClass} ${isLive ? 'ring-2 ring-nava-gold shadow-lg z-10 bg-nava-gold/5' : 'shadow'}`}>
            {isLive && (
                <div
                    className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white ring-2 ring-nava-gold"
                    role="status"
                    aria-label="Live session"
                >
                    <div className="absolute inset-0.5 w-2 h-2 rounded-full bg-nava-gold animate-pulse" />
                </div>
            )}
            <div className="flex-shrink-0">
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${locationColorClass}`}>
                    {LocationIconComponent}
                    <span>{mainText}</span>
                </div>
            </div>

            <div className="flex-grow my-1 flex items-center">
                 <p className="font-bold text-sm text-text-primary leading-tight line-clamp-2">
                    {assignment.topic}
                 </p>
            </div>

            <div className="flex-shrink-0 mt-auto flex items-center gap-1.5 text-xs text-text-muted">
                <UserIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate font-medium">{assignment.instructors.join(', ')}</span>
            </div>
        </div>
    );
};
// FIX: Changed `day` prop type from `string` to `Assignment['day']` to satisfy the type constraints of `DAYS.indexOf`.
const DayHeader: React.FC<{ day: Assignment['day'], isToday: boolean }> = ({ day, isToday }) => {
    const baseClasses = "w-full max-w-xs text-center font-bold text-sm py-2 px-4 rounded-lg border";
    const todayClasses = "bg-kiosk-primary text-white border-transparent";
    const otherDayClasses = "bg-emerald-800 text-white border-transparent";
    
    return (
        <div className={`row-start-1 col-start-${DAYS.indexOf(day) + 2} flex justify-center items-center p-2`}>
            <div className={`${baseClasses} ${isToday ? todayClasses : otherDayClasses}`}>
                {day}
            </div>
        </div>
    );
};


const GroupWeeklyScheduleCard: React.FC<GroupWeeklyScheduleCardProps> = ({ selection, allAssignments, currentPeriodName, today, language }) => {
    const [timePosition, setTimePosition] = useState(-1);

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
      <div 
        className="grid gap-1 h-full"
        style={{
            gridTemplateColumns: 'auto repeat(5, minmax(0, 1fr))',
            gridTemplateRows: 'auto repeat(7, minmax(0, 1fr))'
        }}
      >
        <div className="row-start-1 col-start-1"></div>
        {DAYS.map((day) => (
            <DayHeader key={day} day={day} isToday={day === today} />
        ))}

        {PERIODS.map((period, index) => {
            const isLive = currentPeriodName === period && DAYS.indexOf(today) !== -1;
            return (
                <div key={period} className={`row-start-${index + 2} col-start-1 text-right pr-2 font-montserrat font-semibold text-sm flex items-center justify-end transition-all ${isLive ? 'text-nava-gold scale-110 font-black' : 'text-text-muted'}`}>
                    {period}
                </div>
            );
        })}
        
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