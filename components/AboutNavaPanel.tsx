import React from 'react';

const LeadershipCard: React.FC<{ name: string; title: string; }> = ({ name, title }) => (
    <div className="text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>
        <p className="font-bold text-text-primary">{name}</p>
        <p className="text-sm text-text-muted">{title}</p>
    </div>
);

const NavaAcademyInfoTab: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto pr-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                     <div className="inline-block w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 15.0163 3 19.5 3C22.5 3 24 4.5 24 7.5C24 10.5 22.5 12 19.5 12C15.0163 12 12 8.74722 12 8.74722" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 8.98375 3 4.5 3C1.5 3 0 4.5 0 7.5C0 10.5 1.5 12 4.5 12C8.98375 12 12 8.74722 12 8.74722" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.74722V21" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21H16.5" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">NAVA Academy</h1>
                    <p className="mt-2 text-xl text-text-muted">Powering the Future of Mobility</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-wrap-balance mb-12">
                    <div>
                        <h4 className="font-bold text-2xl text-brand-primary mb-2">Our Mission</h4>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            To cultivate world-class Saudi talent, equipping them with the advanced technical skills and professional competencies required to lead the future of the electric vehicle (EV) industry.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-2xl text-brand-primary mb-2">Our Approach</h4>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            NAVA Academy provides an immersive, hands-on educational experience that bridges theory with practical application. Our curriculum is co-designed with industry giants Ceer and Lucid to ensure our graduates are not just job-ready, but future-ready.
                        </p>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-text-primary mb-8">Leadership Team</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <LeadershipCard name="Director General" title="Academy Director" />
                        <LeadershipCard name="Deputy Director" title="Head of Operations" />
                        <LeadershipCard name="Head of Technical" title="Technical Programs Lead" />
                        <LeadershipCard name="Head of Admin" title="Administration Lead" />
                    </div>
                </div>

                <div>
                    <h3 className="text-3xl font-bold text-text-primary text-center mb-8">Core Programs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
                            <h5 className="font-bold text-xl text-text-primary">EV Industrial Technician Diploma</h5>
                            <p className="text-base text-text-secondary mt-1">Focuses on automated manufacturing and production, covering robotics, PLC systems, and smart manufacturing principles.</p>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
                            <h5 className="font-bold text-xl text-text-primary">EV Service Technician Diploma</h5>
                            <p className="text-base text-text-secondary mt-1">Prepares technicians to diagnose, service, and repair cutting-edge electric vehicles, focusing on high-voltage systems and advanced diagnostics.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NavaAcademyInfoTab;