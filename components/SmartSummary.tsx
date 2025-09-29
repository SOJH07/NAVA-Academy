import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { useLiveStatus } from '../hooks/useLiveStatus';

interface SmartSummaryProps {
    kpis: { totalStudents: number };
    liveStatusData: ReturnType<typeof useLiveStatus>;
    sessionInfo: {
        sessionCounts: { tech: number; professional: number; };
    };
}

const SparkleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-.25.25a.75.75 0 11-1.06-1.06l.25-.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm15 0a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5h-.25a.75.75 0 01-.75-.75zM5.404 15.657a.75.75 0 010-1.06l-.25-.25a.75.75 0 11-1.06 1.06l.25.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25-.25a.75.75 0 11-1.06-1.06l-.25.25a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-.25a.75.75 0 011.5 0v.25A.75.75 0 0110 18z" clipRule="evenodd" /></svg>;

const SmartSummary: React.FC<SmartSummaryProps> = ({ kpis, liveStatusData, sessionInfo }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');
    
    const generateSummary = async () => {
        setIsLoading(true);
        setSummary('');
        setError('');

        const { overallStatus, currentPeriod } = liveStatusData;
        const { totalStudents } = kpis;
        const { sessionCounts } = sessionInfo;

        const prompt = `
            You are an expert operations analyst for NAVA Academy, a technical training institute.
            Based on the following live data, provide a concise, insightful summary (2-3 sentences) for the academy director.
            Focus on the key operational highlights. Be professional and brief, using bullet points for key stats.

            Live Data:
            - Time: ${new Date().toLocaleTimeString('en-US')}
            - Total Students: ${totalStudents}
            - Overall Academy Status: ${overallStatus}
            - Current Period: ${currentPeriod?.name || 'Outside of operational hours'}
            - Active Technical Session Groups: ${sessionCounts.tech}
            - Active Professional Development Groups: ${sessionCounts.professional}

            Example format:
            Good morning. Operations are running smoothly with the academy currently in the '${currentPeriod?.name}' period.
            - All ${totalStudents} students are accounted for.
            - ${sessionCounts.tech} technical groups are actively engaged in training sessions.
        `;

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setSummary(response.text);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred while generating the summary.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-bg-panel dark:bg-dark-panel border border-slate-200 dark:border-dark-border p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Smart Summary</h3>
                <SparkleIcon className="h-5 w-5 text-indigo-500" />
            </div>
            {summary && !isLoading && (
                <div className="text-sm text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap prose prose-sm dark:prose-invert">
                    {summary.split('\n').map((line, i) => <p key={i}>{line.replace(/^-/, '•')}</p>)}
                </div>
            )}
            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

            <div className="mt-4">
                 <button 
                    onClick={generateSummary}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                        </>
                    ) : 'Generate Daily Briefing'}
                </button>
            </div>
        </div>
    );
};

export default SmartSummary;
