import React from 'react';
import type { AnalyzedStudent, StudentGrades } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import useAppStore from '../hooks/useAppStore';

// Icons
const GradesIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> );
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06l-.25.25a.75.75 0 11-1.06-1.06l.25-.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25.25a.75.75 0 11-1.06 1.06l-.25-.25a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm15 0a.75.75 0 01.75-.75h.25a.75.75 0 010 1.5h-.25a.75.75 0 01-.75-.75zM5.404 15.657a.75.75 0 010-1.06l-.25-.25a.75.75 0 11-1.06 1.06l.25.25a.75.75 0 011.06 0zm9.192 0a.75.75 0 011.06 0l.25-.25a.75.75 0 11-1.06-1.06l-.25.25a.75.75 0 010 1.06zM10 18a.75.75 0 01-.75-.75v-.25a.75.75 0 011.5 0v.25A.75.75 0 0110 18z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.852-1.214 3.488 0l5.584 10.68c.636 1.214-.474 2.721-1.744 2.721H4.417c-1.27 0-2.38-1.507-1.744-2.721L8.257 3.099zM10 12a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 7.072l.707-.707a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" /></svg>;


const NAVA_UNITS: (keyof StudentGrades)[] = ['nava001', 'nava002', 'nava003', 'nava004', 'nava005', 'nava006', 'nava007', 'nava008'];
const NAVA_GRADE_MAP: Record<string, string> = { 'D': 'Distinction (80+)', 'M': 'Merit (70-79)', 'P': 'Pass (60-69)', 'UC': 'Unclassified (<60)', 'F': 'Fail (<60)', 'UA': 'Unauthorised Absence' };

const gradeToScore = (grade: string | null): number | null => {
    if (grade === null || grade === 'NA' || grade === '#N/A') return null;
    switch (grade.toUpperCase()) {
        case 'D': return 85; // Mid-point for better visualization
        case 'M': return 75;
        case 'P': return 65;
        case 'UC': case 'F': case 'UA': return 40;
        default: return null;
    }
};

const getPerformanceSegmentStyle = (segment: AnalyzedStudent['performanceSegment']) => {
    switch(segment) {
        case 'High Achievers': return 'bg-green-100 text-green-800';
        case 'Technically Strong': return 'bg-blue-100 text-blue-800';
        case 'Linguistically Strong': return 'bg-indigo-100 text-indigo-800';
        case 'Needs Support': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

interface AiSummaryState { loading: boolean; data: { profileSummary?: string; strengths?: string[]; areasForImprovement?: string[]; recommendation?: string; } | null; error: string; }

const GradePill: React.FC<{grade: string | null}> = ({ grade }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    if (!grade) return <div className="w-16 text-center px-2 py-1 text-xs font-bold rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-body">N/A</div>;
    return (
        <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="w-16 text-center px-2 py-1 text-xs font-bold rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-body">{grade}</div>
            {isHovered && NAVA_GRADE_MAP[grade.toUpperCase()] && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg z-10 animate-fade-in">
                    {NAVA_GRADE_MAP[grade.toUpperCase()]}
                </div>
            )}
        </div>
    );
};

const Section: React.FC<{title: string; icon: React.ReactElement; children: React.ReactNode;}> = ({ title, icon, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mb-2 flex items-center gap-2">
            {icon} {title}
        </h4>
        <div className="bg-slate-50 dark:bg-dark-panel-hover p-3 rounded-lg space-y-2">
            {children}
        </div>
    </div>
);

const StudentDetailModal: React.FC<{ student: AnalyzedStudent | null, onClose: () => void }> = ({ student, onClose }) => {
    const [aiSummary, setAiSummary] = React.useState<AiSummaryState>({ loading: false, data: null, error: '' });
    const { setActivePage, setFilters } = useAppStore();

    React.useEffect(() => {
        if (student) setAiSummary({ loading: false, data: null, error: '' });
    }, [student]);

    if (!student) return null;

    const handleSegmentClick = () => {
        setFilters(f => ({ ...f, performanceSegments: [student.performanceSegment] }));
        setActivePage('studentFinder');
        onClose();
    };
    
    const handleGenerateSummary = async () => {
        setAiSummary({ loading: true, data: null, error: '' });
        const prompt = `You are an expert academic advisor for NAVA Academy, a technical training institute. Analyze the provided student data and generate a JSON object that provides a concise and insightful summary. The summary should be brief, well-organized, and smart, suitable for a director-level overview. The tone should be professional and data-driven.

**Student Data:**
- Name: ${student.fullName} | Company: ${student.company} | Technical Track: ${student.trackName}
- Performance Segment: ${student.performanceSegment}
- GPA: ${student.gpa?.toFixed(2) ?? 'N/A'} (Benchmark: Group Avg ${student.benchmark?.group.gpa.toFixed(2)}, Academy Avg ${student.benchmark?.academy.gpa.toFixed(2)})
- NAVA Average Score: ${student.navaAverageScore?.toFixed(1) ?? 'N/A'} (Benchmark: Group Avg ${student.benchmark?.group.nava.toFixed(1)}, Academy Avg ${student.benchmark?.academy.nava.toFixed(1)})
- Unsatisfactory Grades (UC/F): ${student.ucCount}
- APTIS Overall: ${student.aptisScores?.overall.score} (CEFR: ${student.aptisScores?.overall.cefr ?? 'N/A'}) (Benchmark: Group Avg ${student.benchmark?.group.aptis.toFixed(1)}, Academy Avg ${student.benchmark?.academy.aptis.toFixed(1)})
- APTIS Breakdown (Score/CEFR):
  - Grammar & Vocabulary: ${student.aptisScores?.grammarAndVocabulary.score}
  - Listening: ${student.aptisScores?.listening.score}/${student.aptisScores?.listening.cefr ?? 'N/A'}
  - Reading: ${student.aptisScores?.reading.score}/${student.aptisScores?.reading.cefr ?? 'N/A'}
  - Speaking: ${student.aptisScores?.speaking.score}/${student.aptisScores?.speaking.cefr ?? 'N/A'}
  - Writing: ${student.aptisScores?.writing.score}/${student.aptisScores?.writing.cefr ?? 'N/A'}
**NAVA Grades:**
${NAVA_UNITS.map(unit => `- ${unit.toUpperCase()}: ${student.grades?.[unit] ?? 'N/A'}`).join('\n')}
- English Final Grade: ${student.grades?.englishFinalGrade ?? 'N/A'}`;

        const responseSchema = { type: Type.OBJECT, properties: { profileSummary: { type: Type.STRING, description: "A single, concise sentence (max 25 words) summarizing the student's overall academic and language profile." }, strengths: { type: Type.ARRAY, description: "A list of 1-2 key strengths. Each item should be a very short phrase (max 10 words).", items: { type: Type.STRING } }, areasForImprovement: { type: Type.ARRAY, description: "A list of 1-2 key areas for improvement. Each item should be a very short phrase (max 10 words).", items: { type: Type.STRING } }, recommendation: { type: Type.STRING, description: "A single, actionable recommendation for the student (max 25 words)." } } };

        try {
            if (!process.env.API_KEY) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema } });
            // FIX: Changed toString() to trim() to align with Gemini API guidelines for parsing JSON.
            setAiSummary({ loading: false, data: JSON.parse(response.text.trim()), error: '' });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setAiSummary({ loading: false, data: null, error: `Failed to generate summary: ${errorMessage}` });
        }
    };

    const aptisChartData = student.aptisScores ? [ { subject: 'Grammar', score: student.aptisScores.grammarAndVocabulary.score || 0 }, { subject: 'Listening', score: student.aptisScores.listening.score || 0 }, { subject: 'Reading', score: student.aptisScores.reading.score || 0 }, { subject: 'Speaking', score: student.aptisScores.speaking.score || 0 }, { subject: 'Writing', score: student.aptisScores.writing.score || 0 }, ] : [];
    const navaTrendData = NAVA_UNITS.map(unit => ({ name: unit.replace('nava', 'N'), score: gradeToScore(student.grades?.[unit] ?? null) })).filter(item => item.score !== null);
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-bg-panel dark:bg-dark-panel rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-dark-border flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-xl leading-tight text-text-primary dark:text-dark-text-primary">{student.fullName}</h3>
                        <p className="text-xs text-text-muted dark:text-dark-text-muted">ID: {student.navaId} | {student.company} | {student.techGroup}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-muted hover:bg-slate-200 dark:hover:bg-dark-panel-hover">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <Section title="Performance Overview" icon={<GradesIcon/>}>
                           <div className="text-sm">
                                <strong className="font-medium text-text-secondary dark:text-dark-text-muted w-24 inline-block">Segment:</strong> 
                                <button onClick={handleSegmentClick} className={`px-2.5 py-1 text-xs font-bold rounded-full transition-transform hover:scale-105 ${getPerformanceSegmentStyle(student.performanceSegment)}`}>
                                    {student.performanceSegment}
                                </button>
                            </div>
                            <div className="text-sm"><strong className="font-medium text-text-secondary dark:text-dark-text-muted w-24 inline-block">GPA:</strong> <span className="font-bold">{student.gpa?.toFixed(2) ?? 'N/A'}</span></div>
                            <div className="text-sm"><strong className="font-medium text-text-secondary dark:text-dark-text-muted w-24 inline-block">UC/Fail Grades:</strong> <span className={`font-bold ${student.ucCount > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{student.ucCount}</span></div>
                        </Section>
                        <Section title="NAVA Performance" icon={<GradesIcon/>}>
                           <div className="text-sm"><strong className="font-medium text-text-secondary dark:text-dark-text-muted w-24 inline-block">Avg Score:</strong> <span className="font-bold">{student.navaAverageScore?.toFixed(1) ?? 'N/A'}</span></div>
                           <div className="h-28 -mx-2 -mb-2">
                               <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={navaTrendData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                                       <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                                       <XAxis dataKey="name" fontSize={10} />
                                       <YAxis domain={[40, 90]} fontSize={10}/>
                                       <RechartsTooltip contentStyle={{fontSize: '12px', padding: '4px 8px'}} />
                                       <Line type="monotone" dataKey="score" stroke="#62B766" strokeWidth={2} />
                                   </LineChart>
                               </ResponsiveContainer>
                           </div>
                        </Section>
                        <Section title="APTIS Performance" icon={<GradesIcon/>}>
                           <div className="text-sm"><strong className="font-medium text-text-secondary dark:text-dark-text-muted w-24 inline-block">Overall:</strong> <span className="font-bold">{student.aptisScores?.overall.score ?? 'N/A'}</span></div>
                            <div className="h-40">
                               <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aptisChartData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" fontSize={11} />
                                        <PolarRadiusAxis angle={30} domain={[0, 50]} fontSize={10} />
                                        <Radar name="Score" dataKey="score" stroke="#707F98" fill="#707F98" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                           </div>
                        </Section>
                    </div>
                    {/* Middle Column */}
                    <div className="space-y-6">
                         <Section title="Academic Grades" icon={<GradesIcon />}>
                              <div className="grid grid-cols-4 gap-2 text-center text-sm items-center">
                                  {[ {label: 'Unit 1', value: student.grades?.englishUnit1}, {label: 'Unit 2', value: student.grades?.englishUnit2}, {label: 'Nava Avg.', value: student.grades?.navaEnglishAverage?.toFixed(1)}, {label: 'Final', value: student.grades?.englishFinalGrade} ].map(({label, value}) => (
                                      <div key={label}>
                                          <p className="text-xs font-semibold text-text-muted dark:text-dark-text-muted">{label}</p>
                                          <div className="w-full text-center font-bold text-sm bg-white dark:bg-dark-body border border-slate-300 dark:border-dark-border rounded-md py-1 h-8 flex items-center justify-center">
                                              {(value ?? 'N/A').toString()}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                             <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-dark-border mt-2">
                                {NAVA_UNITS.map(unit => (
                                    <div key={unit} className="flex justify-between items-center text-sm p-1">
                                        <span className="font-semibold text-text-secondary dark:text-dark-text-secondary">{unit.toUpperCase()}</span>
                                        <GradePill grade={student.grades?.[unit] ?? null} />
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                    {/* Right Column */}
                     <div className="space-y-6">
                        <Section title="AI-Powered Summary" icon={<SparkleIcon/>}>
                            <div className="min-h-[280px]">
                                {!aiSummary.data && !aiSummary.loading && !aiSummary.error && (
                                    <div className="flex flex-col items-center justify-center text-center text-text-muted dark:text-dark-text-muted h-full">
                                        <p>Click "Generate" for an AI-powered analysis of this student's profile.</p>
                                    </div>
                                )}
                                {aiSummary.loading && <div className="italic animate-pulse text-sm text-text-muted dark:text-dark-text-muted">Analyzing student data...</div>}
                                {aiSummary.error && <p className="text-sm text-red-600 dark:text-red-400">{aiSummary.error}</p>}
                                {aiSummary.data && (
                                    <div className="space-y-3 text-sm animate-fade-in">
                                        <p className="text-text-primary dark:text-dark-text-primary italic border-l-4 border-brand-primary pl-2">{aiSummary.data.profileSummary}</p>
                                        
                                        {aiSummary.data.strengths?.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <CheckCircleIcon/>
                                                <div>
                                                    <p className="font-semibold text-text-secondary dark:text-dark-text-secondary">Strengths</p>
                                                    <ul className="list-disc list-inside text-text-secondary dark:text-dark-text-muted mt-1">
                                                        {aiSummary.data.strengths.map((item, i) => <li key={`s-${i}`}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {aiSummary.data.areasForImprovement?.length > 0 && (
                                            <div className="flex items-start gap-2">
                                                <ExclamationTriangleIcon/>
                                                <div>
                                                    <p className="font-semibold text-text-secondary dark:text-dark-text-secondary">Improvement Areas</p>
                                                    <ul className="list-disc list-inside text-text-secondary dark:text-dark-text-muted mt-1">
                                                        {aiSummary.data.areasForImprovement.map((item, i) => <li key={`i-${i}`}>{item}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {aiSummary.data.recommendation && (
                                            <div className="flex items-start gap-2">
                                                <LightBulbIcon/>
                                                <div>
                                                    <p className="font-semibold text-text-secondary dark:text-dark-text-secondary">Recommendation</p>
                                                    <p className="text-text-primary dark:text-dark-text-primary mt-1">{aiSummary.data.recommendation}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-slate-200 dark:border-dark-border pt-2 mt-2">
                                 <button onClick={handleGenerateSummary} disabled={aiSummary.loading} className="w-full text-sm font-semibold bg-brand-secondary text-white rounded-lg py-2 hover:bg-opacity-90 disabled:bg-slate-400 flex items-center justify-center gap-2">
                                    <SparkleIcon/>
                                    {aiSummary.loading ? 'Generating...' : 'Regenerate Summary'}
                                </button>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;
