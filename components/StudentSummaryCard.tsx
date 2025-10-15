import React from 'react';
import type { AnalyzedStudent } from '../types';

const getPerformanceSegmentStyle = (segment: AnalyzedStudent['performanceSegment']) => {
    switch(segment) {
        case 'High Achievers': return 'bg-green-100 text-green-800';
        case 'Technically Strong': return 'bg-status-industrial-light text-status-industrial';
        case 'Linguistically Strong': return 'bg-indigo-100 text-indigo-800';
        case 'Needs Support': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const getCefrPillStyle = (cefr?: string) => {
    if (!cefr) return 'bg-slate-200 text-slate-800';
    if (cefr.startsWith('A')) return 'bg-red-100 text-red-800';
    if (cefr.startsWith('B')) return 'bg-status-industrial-light text-status-industrial';
    if (cefr.startsWith('C')) return 'bg-green-100 text-green-800';
    return 'bg-slate-200 text-slate-800';
};

interface StudentSummaryCardProps {
    student: AnalyzedStudent;
    onClick: () => void;
}

const StudentSummaryCard: React.FC<StudentSummaryCardProps> = ({ student, onClick }) => {
    const companyColor = student.company === 'Ceer' ? 'border-brand-ceer' : 'border-brand-lucid';

    return (
        <button 
            onClick={onClick}
            className={`w-full h-full text-left bg-panel border ${companyColor} rounded-xl shadow-md p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-brand-primary overflow-hidden`}>
            
            {/* Top part */}
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg leading-tight text-text-primary">{student.fullName}</h3>
                        <p className="text-xs text-text-muted">ID: {student.navaId} | {student.company}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getPerformanceSegmentStyle(student.performanceSegment)}`}>
                        {student.performanceSegment}
                    </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                    <span className="font-semibold">Track:</span> {student.trackName} ({student.techGroup})
                </p>
            </div>

            {/* Bottom part */}
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <div>
                    <span className="font-semibold text-text-secondary">GPA: </span>
                    <span className="font-bold text-lg text-brand-primary">{student.gpa?.toFixed(2) ?? 'N/A'}</span>
                </div>
                {student.aptisScores && (
                     <div>
                        <span className="font-semibold text-text-secondary">APTIS: </span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getCefrPillStyle(student.aptisScores.overall.cefr)}`}>{student.aptisScores.overall.cefr}</span>
                    </div>
                )}
            </div>
        </button>
    );
};

export default StudentSummaryCard;