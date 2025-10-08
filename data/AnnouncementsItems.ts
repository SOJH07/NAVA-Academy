import { Bulletin } from '../store/bulletinsStore';

const today = new Date();
const todayISO = today.toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().split('T')[0];

export const mockBulletins: Bulletin[] = [
    {
        id: 'launch-note',
        type: 'announcement',
        headline: { en: "Welcome to NAVA Today", ar: "مرحبًا بكم في نافا اليوم"},
        body: { en: "This is your new hub for live academy information. For feedback or ideas, please contact the IT department.", ar: "هذه هي بوابتكم الجديدة للمعلومات المباشرة عن الأكاديمية. للملاحظات أو الأفكار، يرجى التواصل مع قسم تقنية المعلومات."},
        audience: 'all',
        accent: 'blue',
        priority: 'high',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'safety-drill',
        type: 'event',
        date: todayISO,
        timeStart: "14:00",
        timeEnd: "14:30",
        headline: { en: "Safety Drill Today", ar: "تدريب على السلامة اليوم"},
        body: { en: "A campus-wide safety drill will be conducted at 2:00 PM. Please follow instructor guidance.", ar: "سيتم إجراء تدريب على السلامة على مستوى الحرم الجامعي الساعة 2:00 مساءً. يرجى اتباع إرشادات المدرب."},
        audience: 'all',
        priority: 'high',
        accent: 'amber',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'lucid-visit',
        type: 'visit',
        date: tomorrowISO,
        timeStart: '10:00',
        timeEnd: '12:00',
        headline: { en: "Lucid Motors Delegation Visit Tomorrow", ar: "زيارة وفد لوسيد موتورز غداً"},
        body: { en: "We are pleased to welcome a delegation from Lucid Motors. Workshops WS-07 and WS-08 will be involved.", ar: "يسرنا أن نرحب بوفد من شركة لوسيد موتورز. ستشارك ورش العمل WS-07 و WS-08."},
        audience: { groups: ['DPST-01', 'DPST-02', 'DPST-03', 'DPST-04']},
        priority: 'normal',
        accent: 'violet',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'world-ev-day',
        type: 'news',
        headline: { en: 'World EV Day', ar: 'اليوم العالمي للسيارات الكهربائية' },
        body: { en: 'Today we celebrate the progress and future of electric mobility. Your skills are vital to this global shift.', ar: 'نحتفل اليوم بتقدم ومستقبل التنقل الكهربائي. مهاراتكم حيوية لهذا التحول العالمي.' },
        audience: 'all',
        accent: 'green',
        startAt: '2024-09-09T00:00:00Z',
        endAt: '2024-09-09T23:59:59Z',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'world-engineering-day',
        type: 'news',
        headline: { en: 'World Engineering Day', ar: 'اليوم العالمي للهندسة' },
        body: { en: 'Celebrating the engineers who build our world. Your journey in technical excellence starts here.', ar: 'نحتفل بالمهندسين الذين يبنون عالمنا. رحلتكم في التميز التقني تبدأ من هنا.' },
        audience: 'all',
        accent: 'slate',
        startAt: '2025-03-04T00:00:00Z',
        endAt: '2025-03-04T23:59:59Z',
        createdBy: 'Admin',
        createdAt: new Date().toISOString(),
    },
];
