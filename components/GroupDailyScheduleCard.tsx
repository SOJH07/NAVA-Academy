import React from 'react';
import type { DailyPeriod, Assignment, GroupInfo } from '../types';

// Icons
const TheoryIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg>;
const PracticalIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.972.03 2.287-.948 2.287-1.56.38-1.56 2.6 0 2.98.978.238 1.488 1.559.948 2.286-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.948c.38 1.56 2.6 1.56 2.98 0a1.532 1.532 0 012.287-.948c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01.948-2.287c1.56-.38 1.56-2.6 0-2.98a1.532 1.532 0 01-.948-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.948zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

const DAYS: Assignment['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const ARABIC_DAYS: Record<string, string> = { 'Sunday': 'الأحد', 'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس' };

interface GroupWeeklyScheduleCardProps {
  group: string;
  dailySchedule: DailyPeriod[];
  groupAssignments: Assignment[];
  currentPeriodName: string | null;
  groupInfo: GroupInfo;
  language: 'en' | 'ar';
}

const SessionPill: React.FC<{ assignment: Assignment, isLive: boolean, language: 'en' | 'ar' }> = ({ assignment, isLive, language }) => {
    const getLocationType = (classroom: string) => {
        if (classroom.startsWith('WS-') || classroom.startsWith('0.')) return 'workshop';
        if (classroom.startsWith('1.')) return 'lab';
        if (classroom.startsWith('2.') || classroom.startsWith('3.')) return 'classroom';
        return 'classroom'; // default
    };

    const locationType = getLocationType(assignment.classroom);
    const isPractical = locationType === 'lab' || locationType === 'workshop';

    const colorClasses = React.useMemo(() => {
        switch(locationType) {
            case 'workshop':
                return {
                    bg: 'bg-orange-100 dark:bg-orange-900/40',
                    border: 'border-orange-500',
                    liveRing: 'ring-orange-500',
                    icon: <PracticalIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                };
            case 'lab':
                return {
                    bg: 'bg-purple-100 dark:bg-purple-900/40',
                    border: 'border-purple-500',
                    liveRing: 'ring-purple-500',
                    icon: <PracticalIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                };
            case 'classroom':
            default:
                 return {
                    bg: 'bg-blue-100 dark:bg-blue-900/40',
                    border: 'border-blue-500',
                    liveRing: 'ring-blue-500',
                    icon: <TheoryIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                };
        }
    }, [locationType]);

    return (
        <div className={`relative h-full w-full p-2 rounded-lg border-l-4 flex flex-col justify-between ${colorClasses.bg} ${colorClasses.border} ${isLive ? `ring-2 ${colorClasses.liveRing}` : ''}`}>
            {isPractical && <div className="absolute inset-0 bg-repeat bg-center opacity-40" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 10L10 -2M-2 2L2 -2M6 10L10 6' stroke='%23000' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E")`}}></div>}
            <div className="relative z-1">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-kiosk-text-title text-xs leading-tight line-clamp-2">{assignment.topic}</p>
                    {isLive && <span className="text-white text-[10px] font-bold bg-kiosk-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">{language === 'ar' ? 'الآن' : 'LIVE'}</span>}
                </div>
                <p className="text-[11px] text-kiosk-text-muted mt-1">{assignment.instructors.join(', ')}</p>
            </div>
             <div className="relative z-1 flex items-center justify-between text-[11px] font-semibold text-kiosk-text-body mt-auto pt-1 border-t border-current border-opacity-10">
                <span>{assignment.classroom.startsWith('WS-') ? assignment.classroom : `C-${assignment.classroom.replace('.', '')}`}</span>
                {colorClasses.icon}
            </div>
        </div>
    );
};

const GroupWeeklyScheduleCard: React.FC<GroupWeeklyScheduleCardProps> = ({ group, dailySchedule, groupAssignments, currentPeriodName, groupInfo, language }) => {
  const track = groupInfo[group]?.track_name;
  const isIndustrial = track === 'Industrial Tech';
  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as Assignment['day'];

  const scheduleMap = React.useMemo(() => {
    const map = new Map<string, Assignment>();
    groupAssignments.forEach(a => map.set(`${a.day}-${a.period}`, a));
    return map;
  }, [groupAssignments]);

  const periods = dailySchedule.filter(p => p.type === 'class');
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-kiosk-border flex-shrink-0">
        <h3 className={`text-2xl font-bold text-kiosk-text-title ${language === 'ar' ? 'font-kufi text-right' : ''}`}>{language === 'ar' ? `جدول الأسبوع: ${group}` : `Weekly Schedule: ${group}`}</h3>
        <p className={`font-semibold text-base ${isIndustrial ? 'text-status-industrial' : 'text-status-tech'} ${language === 'ar' ? 'text-right' : ''}`}>{track}</p>
      </div>
      <div className="flex-grow overflow-y-auto p-4 -mr-3 pr-3">
        <div className="grid grid-cols-[4rem_repeat(5,1fr)] gap-2">
            {/* Header Row */}
            <div></div>
            {DAYS.map(day => (
                <div key={day} className={`text-center font-bold pb-2 ${day === todayName ? 'text-kiosk-primary' : 'text-kiosk-text-muted'}`}>
                    <p>{language === 'ar' ? ARABIC_DAYS[day] : day.substring(0,3)}</p>
                </div>
            ))}

            {/* Schedule Rows */}
            {periods.map(period => {
                const isLiveRow = currentPeriodName === period.name;
                return (
                    <React.Fragment key={period.name}>
                        <div className={`flex items-center justify-center text-center text-xs font-bold ${isLiveRow ? 'text-kiosk-secondary' : 'text-kiosk-text-muted'}`}>
                            {period.name}
                        </div>
                        {DAYS.map(day => {
                            const assignment = scheduleMap.get(`${day}-${period.name}`);
                            const isLiveCell = isLiveRow && day === todayName;
                            return (
                                <div key={day} className={`h-28 p-1 rounded-md transition-colors ${isLiveCell ? 'bg-kiosk-secondary/10' : ''}`}>
                                    {assignment && <SessionPill assignment={assignment} isLive={isLiveCell} language={language} />}
                                </div>
                            );
                        })}
                    </React.Fragment>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default GroupWeeklyScheduleCard;