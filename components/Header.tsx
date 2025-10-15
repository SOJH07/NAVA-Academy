import React from 'react';

interface HeaderProps {
    pageTitle: string;
    pageIcon?: React.ReactElement;
    onFilterButtonClick: () => void;
    activeFilterCount: number;
    globalSearchTerm: string;
    onSearchChange: (term: string) => void;
}

const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.973.697.176.032.35.178.465.337L22.5 6.001c.115.158.176.354.176.55V8.65c0 .223-.07.435-.194.622l-6.236 9.354a.67.67 0 01-.521.274H8.275a.67.67 0 01-.521-.274L1.52 9.272a.67.67 0 01-.194-.622V6.551c0-.196.06-.392.176-.55L3.562 4.034a.67.67 0 01.465-.337A48.623 48.623 0 0112 3z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;


const Header: React.FC<HeaderProps> = ({ pageTitle, pageIcon, onFilterButtonClick, activeFilterCount, globalSearchTerm, onSearchChange }) => {
    return (
        <header className="px-6 pt-6 pb-4 bg-bg-body z-10 flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                {pageIcon && (
                     <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        {React.cloneElement<React.SVGProps<SVGSVGElement>>(pageIcon, { className: "h-6 w-6 text-white" })}
                    </div>
                )}
                <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </span>
                    <input 
                        type="search"
                        placeholder="Search Students (Name, ID, Group)..."
                        value={globalSearchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-bg-panel border border-slate-300 rounded-lg py-2 px-4 pl-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary w-full md:w-80 shadow-sm"
                    />
                </div>
                <button
                    onClick={onFilterButtonClick}
                    className="flex items-center gap-2 px-4 py-2 bg-bg-panel border border-slate-300 rounded-lg shadow-sm text-text-primary font-semibold hover:bg-bg-panel-hover transition-colors"
                >
                    <FilterIcon />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-brand-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;