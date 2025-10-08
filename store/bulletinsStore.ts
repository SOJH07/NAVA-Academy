import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockBulletins } from '../data/AnnouncementsItems';
import { differenceInHours, parseISO } from 'date-fns';

export interface I18N {
  en?: string;
  ar?: string;
}

export type BulletinType = "announcement" | "visit" | "event" | "news" | "quote";
export type Audience =
  | "all"
  | "students"
  | "staff"
  | { groups?: string[]; floors?: ("G"|"1"|"2"|"3")[] };

export interface Bulletin {
  id: string;
  type: BulletinType;
  headline?: I18N;
  body: I18N;
  date?: string;        // ISO date (for timed overlays)
  timeStart?: string;   // "HH:mm"
  timeEnd?: string;     // "HH:mm"
  startAt?: string;     // visibility window ISO DateTime
  endAt?: string;       // visibility window ISO DateTime
  audience?: Audience;
  priority?: "low"|"normal"|"high";
  accent?: "blue"|"green"|"amber"|"violet"|"slate" | "emerald";
  icon?: string;
  createdBy: string;
  createdAt: string;
}

export const quotesBank = [
    {en:"The present is theirs; the future, for which I work, is mine.", ar:"الحاضر لهم؛ أمّا المستقبل الذي أعمل له فلي.", author: "Nikola Tesla"},
    {en:"Genius is 1% inspiration and 99% perspiration.", ar:"العبقرية ١٪ إلهام و٩٩٪ عمل.", author: "Thomas Edison"},
    {en:"The most dangerous phrase is: We’ve always done it this way.", ar:"أخطر عبارة: هكذا نفعلها دائمًا.", author: "Grace Hopper"},
    {en:"Imagination is the discovering faculty.", ar:"الخيال أداة الاكتشاف.", author: "Ada Lovelace"},
    {en:"Truth is sought for its own sake.", ar:"تُطلَب الحقيقة لذاتها.", author: "Ibn al-Haytham"},
    {en:"Craft joins science to serve people.", ar:"الصنعة تجمع العلم لخدمة الناس.", author: "Al-Jazari"},
    {en:"Hope and curiosity are the engines of achievement.", ar:"الأمل والفضول محرّكا الإنجاز.", author: "Hedy Lamarr"},
    {en:"Trust your code, test it more.", ar:"اثق بكودك واختبره أكثر.", author: "Margaret Hamilton"},
    {en:"Stay hungry. Stay foolish.", ar:"ابقَ جائعًا، ابقَ بسيطًا.", author: "Steve Jobs"},
    {en:"Like what you do, then you will do your best.", ar:"أحب ما تفعل لتفعل أفضل ما لديك.", author: "Katherine Johnson"},
    {en:"The first step is to try.", ar:"الخطوة الأولى أن تحاول.", author: "Elon Musk"},
    {en:"We must believe we are gifted for something.", ar:"علينا أن نؤمن أننا موهوبون لشيء.", author: "Marie Curie"}
];

export function quotesForPeriod(periodIndex: number, date: Date) {
  const seed = Number(`${date.getFullYear()}${date.getMonth()}${date.getDate()}${periodIndex}`);
  const pick = (i: number) => quotesBank[(seed + i) % quotesBank.length];
  return [0, 1, 2, 3, 4].map(pick).map(q => ({...q, en: `“${q.en}”`, ar: `“${q.ar}”`}));
}


interface BulletinsState {
  bulletins: Bulletin[];
  addBulletin: (bulletin: Omit<Bulletin, 'id' | 'createdAt'>) => void;
  deleteBulletin: (id: string) => void;
  getActiveBulletins: (now: Date, audienceFilter?: Audience) => Bulletin[];
}

const useBulletinsStore = create<BulletinsState>()(
  persist(
    (set, get) => ({
      bulletins: mockBulletins,
      addBulletin: (bulletin) => set((state) => ({ 
        bulletins: [
            ...state.bulletins, 
            { ...bulletin, id: new Date().toISOString(), createdAt: new Date().toISOString() }
        ] 
      })),
      deleteBulletin: (id) => set((state) => ({ 
          bulletins: state.bulletins.filter(b => b.id !== id) 
      })),
      getActiveBulletins: (now: Date, audienceFilter: Audience = 'students') => {
          const all = get().bulletins.filter(b => b.type !== 'quote'); // Exclude base quotes from initial fetch

          const active = all.filter(b => {
              // Time window filter
              const start = b.startAt ? parseISO(b.startAt) : null;
              const end = b.endAt ? parseISO(b.endAt) : null;
              if (start && now < start) return false;
              if (end && now > end) return false;

              // Audience filter - simple version for now
              if (b.audience && b.audience !== 'all' && b.audience !== audienceFilter) {
                  // This doesn't handle the complex audience object, but for the kiosk 'students' is enough.
                  return false;
              }

              return true;
          });
          
          // Sort
          active.sort((a, b) => {
              // High priority first
              if (a.priority === 'high' && b.priority !== 'high') return -1;
              if (b.priority === 'high' && a.priority !== 'high') return 1;

              // Events happening today get a boost
              const todayStr = now.toISOString().split('T')[0];
              const aIsToday = a.date === todayStr;
              const bIsToday = b.date === todayStr;
              if (aIsToday && !bIsToday) return -1;
              if (bIsToday && !aIsToday) return 1;

              // Events starting within 24 hours
              const aDate = a.date && a.timeStart ? new Date(`${a.date}T${a.timeStart}`) : null;
              const bDate = b.date && b.timeStart ? new Date(`${b.date}T${b.timeStart}`) : null;

              if (aDate && bDate) {
                  const aDiff = differenceInHours(aDate, now);
                  const bDiff = differenceInHours(bDate, now);
                  if (aDiff >= 0 && aDiff <= 24 && (bDiff < 0 || bDiff > 24)) return -1;
                  if (bDiff >= 0 && bDiff <= 24 && (aDiff < 0 || aDiff > 24)) return 1;
              }
              
              // Fallback to creation date
              return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
          });
          
          return active;
      }
    }),
    {
      name: 'nava-bulletins-store',
    }
  )
);

export default useBulletinsStore;
