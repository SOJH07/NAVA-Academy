import React, { useMemo } from 'react';
import type { Assignment, DailyPeriod, GroupInfo } from '../types';
import { dailyPeriodsData } from '../data/dailyPeriods';
import DailyAssignmentCard from './DailyAssignmentCard';

interface DailyScheduleViewProps {
    assignments: Assignment[];
    selectedDay: Assignment['day'];
    isLiveDay: boolean;
    density: 'comfortable' | 'compact';
    currentPeriod: DailyPeriod | null;
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
    groupInfo: GroupInfo;
}

const processAssignmentsForGrid = (assignments: Assignment[]) => {
    const assignmentsByGroup: { [group: string]: Assignment[] } = {};
    assignments.forEach(a => {
        if (!assignmentsByGroup[a.group]) {
            assignmentsByGroup[a.group] = [];
        }
        assignmentsByGroup[a.group].push(a);
    });

    Object.values(assignmentsByGroup).forEach(groupAssignments => {
        groupAssignments.sort((a, b) => parseInt(a.period.substring(1)) - parseInt(b.period.substring(1)));
    });
    
    const sortedGroups = Object.keys(assignmentsByGroup).sort();

    const blocks: (Assignment & { span: number })[] = [];
    const processedIds = new Set<number>();

    sortedGroups.forEach(group => {
        const groupAssignments = assignmentsByGroup[group];
        for (const assignment of groupAssignments) {
            if (processedIds.has(assignment.id)) continue;

            let span = 1;
            processedIds.add(assignment.id);
            
            let currentPeriodNum = parseInt(assignment.period.substring(1));
            for (let i = groupAssignments.indexOf(assignment) + 1; i < groupAssignments.length; i++) {
                const nextAssignment = groupAssignments[i];
                const nextPeriodNum = parseInt(nextAssignment.period.substring(1));
                if (nextPeriodNum === currentPeriodNum + 1 && nextAssignment.topic === assignment.topic && nextAssignment.instructors.join(',') === assignment.instructors.join(',')) {
                    span++;
                    currentPeriodNum++;
                    processedIds.add(nextAssignment.id);
                } else {
                    break;
                }
            }
            blocks.push({ ...assignment, span });
        }
    });

    return { blocks, groups: sortedGroups };
};

const ScheduleSection: React.FC<{
    title: string;
    groups: string[];
    blocks: (Assignment & { span: number })[];
    periodRowMap: {[key: string]: number};
    density: 'comfortable' | 'compact';
    isLiveDay: boolean;
    currentPeriod: DailyPeriod | null;
    focusedInstructor: string | null;
    setFocusedInstructor: (instructor: string | null) => void;
    showTooltip: (content: React.ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
    groupInfo: GroupInfo;
    titleColorClass?: string;
}> = ({ title, groups, blocks, periodRowMap, density, isLiveDay, currentPeriod, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, groupInfo, titleColorClass }) => {
    if (groups.length === 0) return null;
    
    const isTech = title.includes('Technician');
    const gridTemplateColumns = `minmax(4rem, auto) repeat(${groups.length}, minmax(0, 1fr))`;
    const defaultColor = isTech ? 'text-status-tech' : 'text-status-professional';

    return (
        <div className="mb-8">
            <h3 className={`text-xl font-bold mb-3 px-1 ${titleColorClass || defaultColor}`}>{title}</h3>
            <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns }}>
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-50 z-10 grid grid-cols-1" style={{ gridColumn: '1 / -1', gridTemplateColumns }}>
                        <div className="border-b border-r border-slate-200"></div>
                        {groups.map(g => <div key={g} className="font-bold text-sm p-3 text-center border-b border-r border-slate-200 last:border-r-0 truncate">{g}</div>)}
                    </div>
                    {/* Body */}
                    <div className="grid col-start-1 col-span-full row-start-2" style={{ gridTemplateColumns }}>
                         {/* Time labels & Grid Lines */}
                        <div className="col-start-1 row-start-1 grid divide-y divide-slate-200">
                            {Object.keys(periodRowMap).map(p => {
                                const isLive = isLiveDay && currentPeriod?.name === p;
                                return (
                                    <div key={p} className={`flex items-center justify-center border-r border-slate-200 text-sm transition-colors ${density === 'comfortable' ? 'h-28' : 'h-24'} ${isLive ? 'bg-amber-100 text-amber-700 font-extrabold' : 'text-slate-400 font-bold'}`}>
                                        {p}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Columns for groups */}
                        <div className="col-start-2 col-span-full row-start-1 grid" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))`}}>
                            {groups.map((group) => (
                                <div key={group} className="grid divide-y divide-slate-200">
                                    {Object.keys(periodRowMap).map(p => (
                                        <div key={p} className={`border-r border-slate-200 last:border-r-0 ${density === 'comfortable' ? 'h-28' : 'h-24'}`}></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        
                        {/* Assignments */}
                        <div className="col-start-1 col-span-full row-start-1 grid z-0" style={{ gridTemplateColumns }}>
                             {blocks.map(block => {
                                const col = groups.indexOf(block.group) + 2;
                                const row = periodRowMap[block.period];
                                if (!row) return null;

                                const startPeriodNum = parseInt(block.period.substring(1));
                                const endPeriodNum = startPeriodNum + block.span - 1;
                                const currentPeriodNum = currentPeriod ? parseInt(currentPeriod.name.substring(1)) : -1;
                                const isLive = isLiveDay && currentPeriodNum >= startPeriodNum && currentPeriodNum <= endPeriodNum;
                                
                                return (
                                    <div key={block.id.toString()} style={{ gridColumn: col, gridRow: `${row} / span ${block.span}`}} className="p-1.5 flex">
                                        <DailyAssignmentCard 
                                            assignment={block} 
                                            density={density}
                                            isLive={isLive}
                                            focusedInstructor={focusedInstructor}
                                            setFocusedInstructor={setFocusedInstructor}
                                            showTooltip={showTooltip}
                                            hideTooltip={hideTooltip}
                                            groupInfo={groupInfo}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({ assignments, selectedDay, isLiveDay, density, currentPeriod, focusedInstructor, setFocusedInstructor, showTooltip, hideTooltip, groupInfo }) => {
    
    const dayAssignments = useMemo(() => assignments.filter(a => a.day === selectedDay), [assignments, selectedDay]);

    const industrialAssignments = useMemo(() => dayAssignments.filter(a => a.type === 'Technical' && groupInfo[a.group]?.track_name === 'Industrial Tech'), [dayAssignments, groupInfo]);
    const serviceAssignments = useMemo(() => dayAssignments.filter(a => a.type === 'Technical' && groupInfo[a.group]?.track_name === 'Service Tech'), [dayAssignments, groupInfo]);
    const professionalAssignments = useMemo(() => dayAssignments.filter(a => a.type === 'Professional Development'), [dayAssignments]);


    const { blocks: industrialBlocks, groups: industrialGroups } = useMemo(() => processAssignmentsForGrid(industrialAssignments), [industrialAssignments]);
    const { blocks: serviceBlocks, groups: serviceGroups } = useMemo(() => processAssignmentsForGrid(serviceAssignments), [serviceAssignments]);
    const { blocks: professionalBlocks, groups: professionalGroups } = useMemo(() => processAssignmentsForGrid(professionalAssignments), [professionalAssignments]);

    const classPeriods = useMemo(() => dailyPeriodsData.filter(p => p.type === 'class'), []);
    
    const periodRowMap = useMemo(() => {
        const map: {[key: string]: number} = {};
        classPeriods.forEach((p, i) => {
            map[p.name] = i + 1;
        });
        return map;
    }, [classPeriods]);

    const hasAssignments = industrialBlocks.length > 0 || serviceBlocks.length > 0 || professionalBlocks.length > 0;

    return (
        <div className="h-full overflow-y-auto">
            {!hasAssignments ? (
                 <div className="bg-bg-panel border border-slate-200 rounded-lg shadow-sm h-full flex flex-col items-center justify-center text-text-muted">
                    <h3 className="text-xl font-bold">No assignments scheduled for {selectedDay}.</h3>
                    <p>This may be a non-teaching day or the schedule is not available.</p>
                </div>
            ) : (
                <div className="p-1">
                    {(industrialBlocks.length > 0 || serviceBlocks.length > 0) && (
                        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                             <h2 className="text-2xl font-extrabold text-center mb-4 text-text-primary border-b pb-4">Technical Session</h2>
                             <div className="flex flex-col xl:flex-row gap-x-8">
                                <div className="flex-1 min-w-0">
                                    <ScheduleSection 
                                        title="Industrial Technician"
                                        titleColorClass="text-status-industrial"
                                        groups={industrialGroups}
                                        blocks={industrialBlocks}
                                        periodRowMap={periodRowMap}
                                        density={density}
                                        isLiveDay={isLiveDay}
                                        currentPeriod={currentPeriod}
                                        focusedInstructor={focusedInstructor}
                                        setFocusedInstructor={setFocusedInstructor}
                                        showTooltip={showTooltip}
                                        hideTooltip={hideTooltip}
                                        groupInfo={groupInfo}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ScheduleSection
                                        title="Service Technician"
                                        titleColorClass="text-status-tech"
                                        groups={serviceGroups}
                                        blocks={serviceBlocks}
                                        periodRowMap={periodRowMap}
                                        density={density}
                                        isLiveDay={isLiveDay}
                                        currentPeriod={currentPeriod}
                                        focusedInstructor={focusedInstructor}
                                        setFocusedInstructor={setFocusedInstructor}
                                        showTooltip={showTooltip}
                                        hideTooltip={hideTooltip}
                                        groupInfo={groupInfo}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {professionalBlocks.length > 0 &&
                        <ScheduleSection 
                            title="Professional Development"
                            groups={professionalGroups}
                            blocks={professionalBlocks}
                            periodRowMap={periodRowMap}
                            density={density}
                            isLiveDay={isLiveDay}
                            currentPeriod={currentPeriod}
                            focusedInstructor={focusedInstructor}
                            setFocusedInstructor={setFocusedInstructor}
                            showTooltip={showTooltip}
                            hideTooltip={hideTooltip}
                            groupInfo={groupInfo}
                        />
                    }
                </div>
            )}
        </div>
    );
};

export default DailyScheduleView;