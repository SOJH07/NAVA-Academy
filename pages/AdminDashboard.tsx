import React, { useState, useMemo, useEffect } from 'react';
import type { Page } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import GlobalFilterPanel from '../components/GlobalFilterPanel';
import KpiOverviewPage from './KpiOverview';
import LiveOperationsPage from './LiveOperationsPage';
import CalendarPage from './CalendarPage';
import FacilityManagementPage from './FacilityManagement';
import StudentAnalyticsPage from './StudentAnalyticsPage';
import TeamAndAcademyPage from './TeamAndAcademyPage';
import LiveStatusSidebar from '../components/LiveStatusSidebar';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLiveStatus } from '../hooks/useLiveStatus';
import useAppStore from '../hooks/useAppStore';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import CurriculumAndPacingPage from './CurriculumAndPacing';
import useUserPreferencesStore from '../hooks/useUserPreferencesStore';

const pages: Page[] = [
    { id: 'kpiOverview', label: 'KPI Overview', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V7a2 2 0 012 2h14a2 2 0 012 2v10a2 2 0 01-2 2z" /></svg> },
    { id: 'liveOps', label: 'Live Operations', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'studentAnalytics', label: 'Student Analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg> },
    { id: 'teamAndAcademy', label: 'Team & Academy', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg> },
    { id: 'curriculumAndPacing', label: 'Curriculum & Pacing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg> },
    { id: 'facilityManagement', label: 'Facility Management', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-2 0v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg> },
    { id: 'calendar', label: 'Calendar', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'aboutNava', label: 'About NAVA', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg> },
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
       simulatedTime
    } = useAppStore();

    const { hasSeenConstructionNotice, setHasSeenConstructionNotice } = useUserPreferencesStore();
    const [isNoticeVisible, setIsNoticeVisible] = useState(false);

    useEffect(() => {
        if (!hasSeenConstructionNotice) {
            const timer = setTimeout(() => setIsNoticeVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenConstructionNotice]);

    const handleDismissNotice = () => {
        setIsNoticeVisible(false);
        setHasSeenConstructionNotice(true);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isNoticeVisible) {
                handleDismissNotice();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isNoticeVisible]);

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
            const { classroom, group, trackType } = liveClass;

            if (trackType === 'industrial') industrialGroupsInSession.add(group);
            else if (trackType === 'service') serviceGroupsInSession.add(group);
            else if (trackType === 'professional') professionalGroupsInSession.add(group);

            if (classroom.startsWith('2.')) {
                instructionGroups.add(group);
            } else if (classroom.startsWith('1.') || classroom.startsWith('3.')) {
                applicationGroups.add(group);
            } else if (classroom.startsWith('WS-') || classroom.startsWith('0.')) {
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
                            sessionInfo={{ sessionCounts: sessionInfo.sessionCounts }}
                        />;
            case 'liveOps':
                return <LiveOperationsPage 
                            liveStatusData={liveStatusData}
                        />;
            case 'studentAnalytics':
                return <StudentAnalyticsPage allStudents={analyzedStudents} />;
            case 'aboutNava':
            case 'teamAndAcademy':
                return <TeamAndAcademyPage 
                            defaultTab={activePage === 'aboutNava' ? 'academy' : 'instructors'}
                            groupInfo={dashboardData.groupInfo}
                            groupCompanyMap={dashboardData.groupCompanyMap}
                            dailySchedule={dashboardData.dailySchedule}
                            currentPeriod={liveStatusData.currentPeriod}
                            now={liveStatusData.now}
                            allStudents={analyzedStudents}
                        />;
            case 'curriculumAndPacing':
                return <CurriculumAndPacingPage weekNumber={liveStatusData.weekNumber} />;
            case 'facilityManagement':
                return <FacilityManagementPage />;
            case 'calendar':
                return <CalendarPage />;
            default:
                return <div className="p-8 text-center text-text-muted">Select a page from the sidebar to begin.</div>;
        }
    };

    const currentPage = useMemo(() => pages.find(p => p.id === activePage), [activePage]);

    return (
        <div className="h-screen flex bg-bg-body">
            {isNoticeVisible && (
                <div 
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
                    onClick={handleDismissNotice}
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="notice-title"
                    aria-describedby="notice-description"
                >
                    <div 
                        className="bg-panel/10 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center flex flex-col items-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 id="notice-title" className="text-2xl font-bold text-white">Dashboard Under Development</h2>
                        <p id="notice-description" className="mt-2 text-base text-slate-200 text-wrap-balance">
                            Welcome to the NAVA Academy Dashboard. Please note that this platform is currently under active development. While core features are available, some pages and functionalities are still being implemented. We appreciate your understanding.
                        </p>
                        <button
                            onClick={handleDismissNotice}
                            className="mt-6 w-full max-w-xs bg-brand-primary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-brand-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Acknowledge & Continue
                        </button>
                    </div>
                </div>
            )}
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