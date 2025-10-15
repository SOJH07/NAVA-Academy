import React from 'react';
import type { Page } from '../types';
import useUserPreferencesStore from '../hooks/useUserPreferencesStore';

interface SidebarProps {
  pages: Page[];
  activePage: string;
  setActivePage: (pageId: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pages, activePage, setActivePage, onLogout }) => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useUserPreferencesStore();

  return (
    <aside className={`bg-panel border-r border-slate-200 p-4 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className={`mb-8 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
         <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5,10 C6.5,7 10,7 12,10 C14,13 17.5,13 17.5,10 C17.5,7 14,7 12,10 C10,13 6.5,13 6.5,10Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5V18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18H15" />
            </svg>
         </div>
         <h1 className={`text-xl font-bold text-text-primary whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100 delay-100'}`}>NAVA Academy</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-grow">
        <ul>
          {pages.map((page) => (
            <li key={page.id} className="mb-2">
              <button
                onClick={() => setActivePage(page.id)}
                title={isSidebarCollapsed ? page.label : undefined}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                  activePage === page.id
                    ? 'bg-brand-primary text-white font-semibold'
                    : 'text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary'
                }`}
              >
                <div className="flex-shrink-0">{page.icon}</div>
                <span className={`whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100 delay-100'}`}>{page.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer Area */}
      <div className="flex-shrink-0">
        <div className="border-t border-slate-200 pt-2 space-y-1">
            <button 
                onClick={onLogout}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Logout"
            >
                 <div className="flex-shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M15.75 15l3.75-3.75M15.75 15l-3.75-3.75M19.5 11.25h-9" />
                     </svg>
                </div>
                <span className={`whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100 delay-100'}`}>Logout</span>
            </button>
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            >
                 <div className="flex-shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {isSidebarCollapsed 
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5l-7.5-7.5 7.5-7.5" />
                        }
                     </svg>
                </div>
                <span className={`whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100 delay-100'}`}>Collapse</span>
            </button>
        </div>
        <div className={`mt-2 text-center text-xs text-text-muted whitespace-nowrap transition-opacity ${isSidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <p>PDPL Compliance Notice</p>
            <p>Access is restricted to authorized users.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;