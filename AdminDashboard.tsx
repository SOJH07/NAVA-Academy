import React, { useState, useMemo } from 'react';
import type { Page, AnalyzedStudent } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlobalFilterPanel from './components/GlobalFilterPanel';
import KpiOverviewPage from './pages/KpiOverview';
import LiveOperationsPage from './pages/LiveOperations';
import InstructorSchedulePage from './pages/InstructorSchedule';
import CalendarPage from './pages/CalendarPage';
import StudentFinderPage from './pages/StudentFinder';
import FacilityManagementPage from './pages/FacilityManagement';
import InstructorProfilesPage from './pages/InstructorProfiles';
import AnalyticsPage from './pages/AnalyticsPage';
import GpaAnalysisPage from './pages/GpaAnalysisPage';
import LiveStatusSidebar from './components/LiveStatusSidebar';
import { useDashboardData } from './hooks/useDashboardData';
import { useLiveStatus } from './hooks/useLiveStatus';
import useAppStore from './hooks/useAppStore';
import { useAnalyticsData } from './hooks/useAnalyticsData';

const pages: Page[] = [
    { id: 'kpiOverview', label: 'KPI Overview', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V7a2 2 0 012 2h14a2 2 0 012 2v10a2 2 0 01-2 2z" /></svg> },
    { id: 'liveOps', label: 'Live Operations', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'analytics', label: 'Performance Analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg> },
    { id: 'gpaAnalysis', label: 'GPA Analysis', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3.5a1 1 0 00.028 1.84l7 3.5a1 1 0 00.764 0l7-3.5a1 1 0 00.028-1.84l-7-3.5z" /><path d="M3 9.332V14a1 1 0 00.553.894l6 3a1 1 0 00.894 0l6-3A1 1 0 0017 14v-4.668-2.45l-7 3.5-7-3.5v2.45z" /></svg> },
    { id: 'studentFinder', label: 'Student Finder', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg> },
    { id: 'instructorSchedule', label: 'Instructor Schedule', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'instructorProfiles', label: 'Instructor Profiles', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg> },
    { id: 'facilityManagement', label: 'Facility Management', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-2 0v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg> },
    { id: 'calendar', label: 'Calendar', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
];

const AdminDashboard: React.FC<{onLogout: () => void}> = ({ onLogout }) => {
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isLiveStatusSidebarCollapsed, setIsLiveStatusSidebarCollapsed] = useState(false);
    
    const { 
       activePage, setActivePage,
       globalSearchTerm, setGlobalSearchTerm,
       filters, setFilters,
       toggleArrayFilter, toggleSessionTypeFilter,
       clearFilters,
       activeFilterCount,
       // FIX: Get simulatedTime from the store to pass to useLiveStatus.
       simulatedTime
    } = useAppStore();

    const dashboardData = useDashboardData();
    const { analyzedStudents } = useAnalyticsData(dashboardData.enhancedStudents);

    const liveStatusData = useLiveStatus(
        analyzedStudents,
        dashboardData.dailySchedule,
        dashboardData.groupInfo,
        dashboardData.processedScheduleData,
        simulatedTime
    );

    const sessionInfo = useMemo(() => {
        const industrialGroupsInSession = new Set<string>();
        const serviceGroupsInSession = new Set<string>();
        const professionalGroupsInSession = new Set<string>();
        
        const instructionGroups = new Set<string>();
        const applicationGroups = new Set<string>();
        const collaborationGroups = new Set<string>();

        liveStatusData.liveClasses.forEach(liveClass => {
            // FIX: Destructured 'trackType' instead of 'type' from 'liveClass' to resolve property access error.
            const { classroom, group, trackType } = liveClass;

            if (trackType === 'industrial') industrialGroupsInSession.add(group);
            else if (trackType === 'service') serviceGroupsInSession.add(group);
            else if (trackType === 'professional') professionalGroupsInSession.add(group);

            if (classroom.startsWith('2.')) {
                instructionGroups.add(group);
            } else if (classroom.startsWith('1.')) {
                applicationGroups.add(group);
            } else if (classroom.startsWith('WS-')) {
                collaborationGroups.add(group);
            }
        });
        
        return {
            sessionCounts: {
                industrial: industrialGroupsInSession.size,
                service: serviceGroupsInSession.size,
                professional: professionalGroupsInSession.size,
                tech: industrialGroupsInSession.size + serviceGroupsInSession.size,
                instruction: instructionGroups.size,
                application: applicationGroups.size,
                collaboration: collaborationGroups.size,
            },
            sessionGroups: {
                industrial: Array.from(industrialGroupsInSession).sort(),
                service: Array.from(serviceGroupsInSession).sort(),
                professional: Array.from(professionalGroupsInSession).sort(),
            }
        };
    }, [liveStatusData.liveClasses]);


    const renderPage = () => {
        switch (activePage) {
            case 'kpiOverview':
                return <KpiOverviewPage
                            allStudents={analyzedStudents}
                            students={liveStatusData.liveStudents}
                            liveStatusData={liveStatusData}
                            sessionInfo={{
                                sessionCounts: sessionInfo.sessionCounts
                            }}
                        />;
            case 'liveOps':
                return <LiveOperationsPage 
                            liveStatusData={liveStatusData}
                        />;
            case 'analytics':
                return <AnalyticsPage 
                            allStudents={analyzedStudents}
                        />;
             case 'gpaAnalysis':
                return <GpaAnalysisPage 
                            allStudents={analyzedStudents}
                        />;
            case 'studentFinder':
                return <StudentFinderPage
                            analyzedStudents={analyzedStudents}
                        />;
            case 'instructorSchedule':
                return <InstructorSchedulePage 
                            groupInfo={dashboardData.groupInfo}
                            groupCompanyMap={dashboardData.groupCompanyMap}
                            dailySchedule={dashboardData.dailySchedule}
                            currentPeriod={liveStatusData.currentPeriod}
                            now={liveStatusData.now}
                            allStudents={analyzedStudents}
                        />;
            case 'instructorProfiles':
                return <InstructorProfilesPage 
                            groupInfo={dashboardData.groupInfo}
                        />;
            case 'facilityManagement':
                return <FacilityManagementPage />;
            case 'calendar':
                return <CalendarPage />;
            default:
                return <div>Select a page</div>;
        }
    };

    const currentPage = useMemo(() => pages.find(p => p.id === activePage), [activePage]);

    return (
        <div className="h-screen flex bg-bg-body dark:bg-dark-body">
            <Sidebar pages={pages} activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
             <GlobalFilterPanel 
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                filters={filters}
                setFilters={setFilters}
                toggleArrayFilter={toggleArrayFilter}
                clearFilters={clearFilters}
                allFilterOptions={dashboardData.allFilterOptions}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    pageTitle={currentPage?.label || 'Dashboard'}
                    pageIcon={currentPage?.icon}
                    onFilterButtonClick={() => setIsFilterPanelOpen(true)}
                    activeFilterCount={activeFilterCount}
                    globalSearchTerm={globalSearchTerm}
                    onSearchChange={setGlobalSearchTerm}
                />
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {renderPage()}
                </div>
            </main>
             <LiveStatusSidebar 
                liveStatusData={liveStatusData} 
                dailySchedule={dashboardData.dailySchedule}
                assignments={dashboardData.processedScheduleData}
                sessionInfo={sessionInfo}
                filters={filters}
                toggleArrayFilter={toggleArrayFilter}
                toggleSessionTypeFilter={toggleSessionTypeFilter}
                isCollapsed={isLiveStatusSidebarCollapsed}
                setIsCollapsed={setIsLiveStatusSidebarCollapsed}
            />
        </div>
    );
};

export default AdminDashboard;