
import React from 'react';

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerContent?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, className, headerContent }) => (
    <div className={`bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border p-4 md:p-6 rounded-lg shadow-sm h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-text-primary dark:text-dark-text-primary">{title}</h3>
        {headerContent}
      </div>
      <div className="flex-grow w-full min-h-[20rem] min-w-0">
        {children}
      </div>
    </div>
);

export default ChartContainer;