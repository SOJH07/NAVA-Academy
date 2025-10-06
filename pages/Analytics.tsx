import React from 'react';
import type { AnalyzedStudent } from '../types';
import StudentAnalyticsPage from './StudentAnalyticsPage';

interface AnalyticsPageProps {
    allStudents: AnalyzedStudent[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ allStudents }) => {
    // This is a wrapper for the main analytics page, which defaults to the overview tab.
    return <StudentAnalyticsPage allStudents={allStudents} />;
};

export default AnalyticsPage;
