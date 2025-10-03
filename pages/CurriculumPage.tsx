import React from 'react';
import { foundationSubjects, year2IndustrialSubjects, year2ServiceSubjects } from '../data/subjects';

const CurriculumPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary dark:text-dark-text-primary tracking-tight">Curriculum Overview</h1>
        <p className="text-base text-text-muted dark:text-dark-text-muted mt-1">Official subject listing for all NAVA Academy programs.</p>
      </div>

      {/* Foundation Program */}
      <div className="bg-bg-panel dark:bg-dark-panel rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-dark-border">
        <div className="p-4 bg-slate-100 dark:bg-dark-panel-hover border-b border-slate-200 dark:border-dark-border">
          <h3 className="font-bold text-xl text-text-primary dark:text-dark-text-primary">
            Year 1: Foundation Program ({foundationSubjects.length} Subjects)
          </h3>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {foundationSubjects.map((subject) => (
            // FIX: Inlined the SubjectPill component to resolve a TypeScript error with the 'key' prop.
            <div key={subject.code} className="bg-slate-100 dark:bg-dark-panel p-3 rounded-lg text-center shadow-sm hover:bg-slate-200 dark:hover:bg-dark-panel-hover hover:shadow-md transition-all duration-200">
              <p className="font-bold text-sm text-slate-800 dark:text-dark-text-primary">{subject.code}</p>
              <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">{subject.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Year 2 */}
      <div>
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Year 2: Specialization Tracks</h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Industrial Technician Card */}
        <div className="bg-bg-panel dark:bg-dark-panel rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-dark-border">
          <div className="p-4 bg-status-industrial-light dark:bg-status-industrial/20 border-b border-status-industrial/30">
            <h3 className="font-bold text-xl text-status-industrial">
              Industrial Technician ({year2IndustrialSubjects.length} Subjects)
            </h3>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 h-[40rem] overflow-y-auto">
            {year2IndustrialSubjects.map((subject) => (
              // FIX: Inlined the SubjectPill component to resolve a TypeScript error with the 'key' prop.
              <div key={subject.code} className="bg-slate-100 dark:bg-dark-panel p-3 rounded-lg text-center shadow-sm hover:bg-slate-200 dark:hover:bg-dark-panel-hover hover:shadow-md transition-all duration-200">
                <p className="font-bold text-sm text-slate-800 dark:text-dark-text-primary">{subject.code}</p>
                <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">{subject.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service Technician Card */}
        <div className="bg-bg-panel dark:bg-dark-panel rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-dark-border">
          <div className="p-4 bg-status-tech-light dark:bg-status-tech/20 border-b border-status-tech/30">
            <h3 className="font-bold text-xl text-status-tech">
              Service Technician ({year2ServiceSubjects.length} Subjects)
            </h3>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 h-[40rem] overflow-y-auto">
            {year2ServiceSubjects.map((subject) => (
              // FIX: Inlined the SubjectPill component to resolve a TypeScript error with the 'key' prop.
              <div key={subject.code} className="bg-slate-100 dark:bg-dark-panel p-3 rounded-lg text-center shadow-sm hover:bg-slate-200 dark:hover:bg-dark-panel-hover hover:shadow-md transition-all duration-200">
                <p className="font-bold text-sm text-slate-800 dark:text-dark-text-primary">{subject.code}</p>
                <p className="text-xs text-slate-600 dark:text-dark-text-secondary mt-1">{subject.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumPage;