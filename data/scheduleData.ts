import type { Assignment } from '../types';

const rawScheduleData = [
  // DPIT-01
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '1.10', instructor: 'Moazzam', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Eldaw', topic: 'Unit 8 - Professional Development' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '1.10', instructor: 'Moazzam', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Eldaw', topic: 'Unit 8 - Professional Development' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '1.10', instructor: 'Moazzam', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Eldaw', topic: 'Unit 8 - Professional Development' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '1.10', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Eldaw', topic: 'Unit 8 - Professional Development' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-01', classroom: '1.10', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-01', classroom: '2.01', instructor: 'Eldaw', topic: 'Unit 8 - Professional Development' },

  // DPIT-02
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '1.15', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.02', instructor: 'Hassan', topic: 'Unit 8 - Professional Development' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '1.15', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.02', instructor: 'Hassan', topic: 'Unit 8 - Professional Development' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-02', classroom: '1.15', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.02', instructor: 'Hassan', topic: 'Unit 8 - Professional Development' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-02', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.01', instructor: 'Hassan', topic: 'Unit 8 - Professional Development' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-02', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-02', classroom: '2.01', instructor: 'Hassan', topic: 'Unit 8 - Professional Development' },

  // DPIT-03
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '1.15', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.02', instructor: 'Amrendra', topic: 'Unit 8 - Professional Development' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '1.15', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.02', instructor: 'Amrendra', topic: 'Unit 8 - Professional Development' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-03', classroom: '1.15', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.02', instructor: 'Amrendra', topic: 'Unit 8 - Professional Development' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-03', classroom: 'WS-0.6', instructor: 'Moazzam', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.02', instructor: 'Amrendra', topic: 'Unit 8 - Professional Development' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-03', classroom: 'WS-0.6', instructor: 'Moazzam', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-03', classroom: '2.02', instructor: 'Amrendra', topic: 'Unit 8 - Professional Development' },

  // DPIT-04
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-04', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.03', instructor: 'Muhammad Asif', topic: 'Unit 8 - Professional Development' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-04', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.03', instructor: 'Muhammad Asif', topic: 'Unit 8 - Professional Development' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-04', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.03', instructor: 'Muhammad Asif', topic: 'Unit 8 - Professional Development' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '1.10', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.03', instructor: 'Muhammad Asif', topic: 'Unit 8 - Professional Development' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-04', classroom: '1.10', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-04', classroom: '2.03', instructor: 'Muhammad Asif', topic: 'Unit 8 - Professional Development' },

  // DPIT-05
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-05', classroom: 'WS-0.6', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.04', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-05', classroom: 'WS-0.6', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.04', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-05', classroom: 'WS-0.6', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.04', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '1.15', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.04', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-05', classroom: '1.15', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-05', classroom: '2.04', instructor: 'Venkata', topic: 'Unit 9 - Instrumentation & Control' },

  // DPIT-06
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '1.03', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.05', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '1.03', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.05', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '1.03', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.05', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.05', instructor: 'Muteeb', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.05', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-06', classroom: '2.05', instructor: 'Muteeb', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-06', classroom: '2.05', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },

  // DPIT-07
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPIT-07', classroom: '2.07', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPIT-07', classroom: '2.07', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPIT-07', classroom: '2.07', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPIT-07', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPIT-07', classroom: '1.03', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPIT-07', classroom: '2.07', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPIT-07', classroom: '1.03', instructor: 'Fathi', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPIT-07', classroom: '2.07', instructor: 'Sajid Rahman', topic: 'Unit 9 - Instrumentation & Control' },

  // DPST-01
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.08', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-01', classroom: 'WS-0.6', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.08', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-01', classroom: 'WS-0.6', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-01', classroom: '2.08', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-01', classroom: 'WS-0.6', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-01', classroom: '1.09', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-01', classroom: '2.08', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-01', classroom: '1.09', instructor: 'Guru', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-01', classroom: '2.08', instructor: 'Abdul Basit', topic: 'Unit 9 - Instrumentation & Control' },

  // DPST-02
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-02', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-02', classroom: '2.09', instructor: 'Fahd', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-02', classroom: 'WS-0.5', instructor: 'Sikandar', topic: 'Unit 9 - Instrumentation & Control' },

  // DPST-03
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPST-03', classroom: 'WS-0.6', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPST-03', classroom: '2.10', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPST-03', classroom: 'WS-0.6', instructor: 'Ali Sameh', topic: 'Unit 9 - Instrumentation & Control' },

  // DPFD-01
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DFPD-01', classroom: '2.11', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DFPD-01', classroom: '2.11', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DFPD-01', classroom: '2.11', instructor: 'Azfar Ali', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DFPD-01', classroom: '2.11', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },

  // DPFD-02
  { Day: 'Sunday', Period: 'P 1-4', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Sunday', Period: 'P 5-7', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 1-4', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Monday', Period: 'P 5-7', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 1-4', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Tuesday', Period: 'P 5-7', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 1-4', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Wednesday', Period: 'P 5-7', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 1-4', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
  { Day: 'Thursday', Period: 'P 5-7', Group: 'DPFD-02', classroom: '2.12', instructor: 'Mustafa', topic: 'Unit 9 - Instrumentation & Control' },
];

export const processedScheduleData: Assignment[] = [];
let idCounter = 1;

rawScheduleData.forEach(item => {
    if (!item.Period || !item.Day || !item.Group || !item.classroom || !item.instructor || !item.topic) {
        return;
    }
    
    const type: 'Technical' | 'Professional Development' = item.topic.includes('Professional Development') ? 'Professional Development' : 'Technical';

    const periods = item.Period.split(',').flatMap(p => {
        const trimmedP = p.trim();
        if (trimmedP.includes('-')) {
            const parts = trimmedP.substring(2).split('-').map(s => parseInt(s.trim(), 10));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const [start, end] = parts;
                const periodList = [];
                for (let i = start; i <= end; i++) {
                    periodList.push(`P${i}`);
                }
                return periodList;
            }
        }
        return [trimmedP];
    });

    periods.forEach(period => {
        if (period) {
            processedScheduleData.push({
                id: idCounter++,
                day: item.Day as Assignment['day'],
                period: period as Assignment['period'],
                group: item.Group,
                classroom: item.classroom,
                instructors: [item.instructor],
                topic: item.topic,
                type: type,
            });
        }
    });
});

const techInstructors = new Set<string>();
const professionalInstructors = new Set<string>();

processedScheduleData.forEach(assignment => {
    assignment.instructors.forEach(instructor => {
        if (assignment.type === 'Technical') {
            techInstructors.add(instructor);
        } else {
            professionalInstructors.add(instructor);
        }
    });
});

export const allInstructors = {
    tech: Array.from(techInstructors).sort(),
    professional: Array.from(professionalInstructors).sort(),
};
