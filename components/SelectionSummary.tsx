import React from 'react';
import type { EnhancedStudent } from '../types';
import useAppStore from '../hooks/useAppStore';

interface SelectionSummaryProps {
    students: EnhancedStudent[];
    totalStudents: number;
}

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);


const SelectionSummary: React.FC<SelectionSummaryProps> = ({ students, totalStudents }) => {
    const { clearFilters } = useAppStore();

    return (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-lg flex justify-between items-center animate-fade-in">
            <div className="flex items-center gap-3">
                <InfoIcon className="h-6 w-6 text-green-500" />
                <p className="font-semibold">
                    Showing data for {students.length} of {totalStudents} students based on active filters.
                </p>
            </div>
            <button 
                onClick={clearFilters}
                className="font-bold text-sm bg-white/50 text-green-700 px-4 py-2 rounded-lg hover:bg-white/80 transition-colors"
            >
                Clear Filters
            </button>
        </div>
    );
};

export default SelectionSummary;