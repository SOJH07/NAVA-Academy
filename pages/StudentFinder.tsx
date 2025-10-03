import React, { useMemo, useState, useEffect } from 'react';
import type { AnalyzedStudent, FoundationGrades } from '../types';
import AutoSizer from 'react-virtualized-auto-sizer';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
import useAppStore from '../hooks/useAppStore';
import { useDebounce } from '../hooks/useDebounce';
import StudentSummaryCard from '../components/StudentSummaryCard';
import StudentDetailModal from '../components/StudentDetailModal';

const NAVA_UNITS: (keyof FoundationGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];

interface StudentFinderPageProps {
    analyzedStudents: AnalyzedStudent[];
}

const StudentFinderPage: React.FC<StudentFinderPageProps> = ({ analyzedStudents }) => {
    const { filters, globalSearchTerm } = useAppStore();
    const debouncedSearchTerm = useDebounce(globalSearchTerm, 300);
    const [selectedStudent, setSelectedStudent] = useState<AnalyzedStudent | null>(null);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columnCount = useMemo(() => {
        if (width < 768) return 1;
        if (width < 1280) return 2;
        if (width < 1536) return 3;
        return 4;
    }, [width]);

    const hasActiveSearchOrFilters = useMemo(() => {
        return debouncedSearchTerm.trim().length > 0 ||
            Object.values(filters).some(f => Array.isArray(f) && f.length > 0) ||
            filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4;
    }, [debouncedSearchTerm, filters]);

    const finalFilteredStudents = useMemo(() => {
        let studentsToFilter = analyzedStudents;

        if (filters.companies.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.companies.includes(s.company));
        if (filters.techTracks.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techTracks.includes(s.trackName));
        // FIX: Added a check to ensure `s.aptisScores.overall.cefr` is not undefined before calling `includes`.
        if (filters.aptisCEFRLevels.length > 0) studentsToFilter = studentsToFilter.filter(s => s.aptisScores?.overall.cefr && filters.aptisCEFRLevels.includes(s.aptisScores.overall.cefr));
        if (filters.techGroups.length > 0) studentsToFilter = studentsToFilter.filter(s => filters.techGroups.includes(s.techGroup));
        if (filters.technicalGrades.length > 0) {
            // FIX: Removed `.foundation` to access grades from the flattened StudentGrades structure.
            studentsToFilter = studentsToFilter.filter(s => s.grades && NAVA_UNITS.some(unit => { const grade = s.grades?.[unit]; return typeof grade === 'string' ? filters.technicalGrades.includes(grade) : false; }));
        }
        if (filters.performanceSegments.length > 0) {
            studentsToFilter = studentsToFilter.filter(s => filters.performanceSegments.includes(s.performanceSegment));
        }
        if (filters.gpaRange[0] > 0 || filters.gpaRange[1] < 4) {
            studentsToFilter = studentsToFilter.filter(s => {
                if (s.gpa === null) return false;
                return s.gpa >= filters.gpaRange[0] && s.gpa <= filters.gpaRange[1];
            });
        }


        if (debouncedSearchTerm.trim().length > 0) {
            const lowercasedFilter = debouncedSearchTerm.toLowerCase();
            studentsToFilter = studentsToFilter.filter(student => 
                student.fullName.toLowerCase().includes(lowercasedFilter) || 
                // FIX: Used `toString()` to ensure the search is performed on a string representation of the navaId.
                student.navaId.toString().includes(lowercasedFilter) || 
                student.techGroup.toLowerCase().includes(lowercasedFilter)
            );
        }
        return studentsToFilter;
    }, [analyzedStudents, debouncedSearchTerm, filters]);

    const studentRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < finalFilteredStudents.length; i += columnCount) {
            rows.push(finalFilteredStudents.slice(i, i + columnCount));
        }
        return rows;
    }, [finalFilteredStudents, columnCount]);

    const CARD_HEIGHT = 160;
    const CARD_MARGIN = 24;

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const row = studentRows[index];
        if (!row) return null;

        const adjustedStyle = {
            ...style,
            top: `${(style.top as number) + CARD_MARGIN / 2}px`,
            height: `${(style.height as number) - CARD_MARGIN}px`,
        };

        return (
            <div style={adjustedStyle} className="flex items-stretch justify-start gap-6 px-3">
                {row.map(student => (
                    <div key={student.navaId} className="w-full h-full">
                        <StudentSummaryCard 
                            student={student} 
                            onClick={() => setSelectedStudent(student)} 
                        />
                    </div>
                ))}
                {/* Add placeholders to keep grid alignment */}
                {Array.from({ length: columnCount - row.length }).map((_, i) => (
                    <div key={`placeholder-${i}`} className="w-full h-full" />
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
             <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
             <div className="flex-shrink-0 mb-4">
                <p className="text-text-muted dark:text-dark-text-muted">{`Showing ${finalFilteredStudents.length} of ${analyzedStudents.length} students.`}</p>
             </div>
             <div className="flex-grow min-h-0">
                {finalFilteredStudents.length > 0 ? (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List 
                                height={height} 
                                width={width} 
                                itemCount={studentRows.length} 
                                itemSize={CARD_HEIGHT + CARD_MARGIN}
                                itemKey={(index: number) => studentRows[index]?.map(s => s.navaId).join('-') || index}
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                ) : (
                    <div className="flex-grow text-center py-20 text-text-muted dark:text-dark-text-muted bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border rounded-lg shadow-sm flex items-center justify-center">
                        <div>
                            <h3 className="text-xl font-bold">No Students Found</h3>
                            <p className="text-base mt-1">
                                {hasActiveSearchOrFilters
                                    ? "No students match the current search or filter criteria."
                                    : "There are no students to display."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFinderPage;