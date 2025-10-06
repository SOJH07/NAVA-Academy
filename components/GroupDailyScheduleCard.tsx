import React from 'react';
import type { DailyPeriod, Assignment, GroupInfo } from '../types';

const ClassIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-1.082.186l-6.5 5.5a1 1 0 00-.312.746V16a1 1 0 001 1h2.158a1 1 0 00.863-.486l1.842-3.223a1 1 0 011.71 0l1.842 3.223a1 1 0 00.863.486H15a1 1 0 001-1V8.512a1 1 0 00-.312-.746l-6.5-5.5a1 1 0 00-.794-.186zM12 10a2 2 0 10-4 0 2 2 0 004 0z" /></svg>;
const BreakIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zM15 5a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h1zM3 5.5A.5.5 0 013.5 5h1a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-2zM5 11a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" /><path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>;

interface GroupDailyScheduleCardProps {
  group: string;
  dailySchedule: DailyPeriod[];
  groupAssignments: Assignment[];
  currentPeriodName: string | null;
  groupInfo: GroupInfo;
}

const GroupDailyScheduleCard: React.FC<GroupDailyScheduleCardProps> = ({ group, dailySchedule, groupAssignments, currentPeriodName, groupInfo }) => {
  const track = groupInfo[group]?.track_name;
  const isIndustrial = track === 'Industrial Tech';
  const colorClasses = {
    bg: isIndustrial ? 'bg-status-industrial-light' : 'bg-status-tech-light',
    border: isIndustrial ? 'border-status-industrial' : 'border-status-tech',
    text: isIndustrial ? 'text-kiosk-text-body' : 'text-kiosk-text-body',
    liveRing: isIndustrial ? 'ring-status-industrial' : 'ring-status-tech',
    liveBg: isIndustrial ? 'bg-status-industrial' : 'bg-status-tech'
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-kiosk-border flex-shrink-0">
        <h3 className="text-2xl font-bold text-kiosk-text-title">Schedule: {group}</h3>
        <p className={`font-semibold text-base ${isIndustrial ? 'text-status-industrial' : 'text-status-tech'}`}>{track}</p>
      </div>
      <div className="flex-grow overflow-y-auto p-4 -mr-3 pr-3">
        <div className="relative">
          <div className="absolute top-2 left-[19px] w-0.5 h-full bg-kiosk-border -z-10"></div>
          
          <ul className="space-y-1">
            {dailySchedule.map(period => {
              const isLive = currentPeriodName === period.name;
              const assignment = period.type === 'class' ? groupAssignments.find(a => a.period === period.name) : null;
              
              const formatTime = (time: string) => new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

              if (period.type === 'break') {
                return (
                  <li key={period.name} className="relative p-2 pl-12">
                     <div className={`absolute top-1/2 -translate-y-1/2 left-[11px] w-4 h-4 rounded-full border-4 border-kiosk-panel z-10 ${isLive ? 'bg-kiosk-secondary ring-2 ring-kiosk-secondary animate-pulse' : 'bg-slate-400'}`}></div>
                     <div className="flex items-center gap-3">
                        <BreakIcon className="h-8 w-8 text-slate-500" />
                        <div>
                            <p className="font-semibold text-lg text-kiosk-text-body">{period.name}</p>
                            <p className="text-sm text-kiosk-text-muted">{formatTime(period.start)} - {formatTime(period.end)}</p>
                        </div>
                     </div>
                  </li>
                );
              }

              return (
                  <li key={period.name} className="relative p-2 pl-12">
                    <div className={`absolute top-1/2 -translate-y-1/2 left-[11px] w-4 h-4 rounded-full border-4 border-kiosk-panel z-10 ${isLive ? `ring-2 ${colorClasses.liveRing}` : ''} ${assignment ? (isLive ? colorClasses.liveBg : colorClasses.border) : 'bg-slate-300'}`}>
                         {isLive && assignment && <div className={`w-full h-full rounded-full animate-ping absolute ${colorClasses.liveBg}`}></div>}
                    </div>
                    {assignment ? (
                         <div className={`p-3 rounded-lg border-l-4 ${colorClasses.border} ${colorClasses.bg}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-base text-kiosk-text-title">{assignment.topic}</p>
                                    <p className="text-sm text-kiosk-text-body">{assignment.instructors.join(', ')}</p>
                                </div>
                                {isLive && <span className={`text-xs font-bold ${colorClasses.liveBg} text-white px-2 py-0.5 rounded-full`}>LIVE</span>}
                            </div>
                            <div className="text-sm text-kiosk-text-muted mt-2 pt-2 border-t border-current border-opacity-20 flex justify-between">
                               <span>{formatTime(period.start)} - {formatTime(period.end)}</span>
                               <span className="font-semibold">Room: {assignment.classroom.startsWith('C-') || assignment.classroom.startsWith('WS-') ? assignment.classroom : `C-${assignment.classroom.replace('.', '')}`}</span>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center gap-3 h-[88px]">
                             <ClassIcon className="h-8 w-8 text-slate-400"/>
                            <div>
                                <p className="font-semibold text-lg text-kiosk-text-muted">Unscheduled</p>
                                <p className="text-sm text-kiosk-text-muted">{formatTime(period.start)} - {formatTime(period.end)}</p>
                            </div>
                         </div>
                    )}
                  </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupDailyScheduleCard;
