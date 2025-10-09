import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockBulletins } from '../data/AnnouncementsItems';
// FIX: 'parse' and 'parseISO' are not top-level exports in the project's date-fns setup. Importing from submodules.
import { differenceInHours } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import parse from 'date-fns/parse';

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
  author?: string; // For quotes
  date?: string;        // YYYY-MM-DD (for timed events)
  timeStart?: string;   // "HH:mm"
  timeEnd?: string;     // "HH:mm"
  startAt?: string;     // visibility window ISO DateTime
  endAt?: string;       // visibility window ISO DateTime
  audience?: Audience;
  priority?: "low"|"normal"|"high";
  accent?: "blue"|"green"|"amber"|"violet"|"slate" | "emerald";
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

const audienceMatches = (bulletinAudience: Audience = 'all', filterAudience: Audience = 'all'): boolean => {
    if (bulletinAudience === 'all' || filterAudience === 'all') return true;
    if (typeof bulletinAudience === 'string' && typeof filterAudience === 'string') {
        return bulletinAudience === filterAudience;
    }
    // This logic is simplified; the schedule overlay component has more specific group filtering.
    // For the marquee, we just check if it's meant for the general student body.
    if (filterAudience === 'students' && (bulletinAudience === 'students' || typeof bulletinAudience === 'object')) return true;

    return false;
};

const isInWindow = (bulletin: Bulletin, now: Date): boolean => {
    // A bulletin is active if it's timeless OR its visibility window is active.
    // The `date` field is for display on a specific day, not for visibility window.
    const isTimeless = !bulletin.startAt && !bulletin.endAt;
    if (isTimeless) return true;

    const start = bulletin.startAt ? parseISO(bulletin.startAt) : null;
    const end = bulletin.endAt ? parseISO(bulletin.endAt) : null;
    return (!start || now >= start) && (!end || now <= end);
};

const isStartingSoon = (bulletin: Bulletin, now: Date): boolean => {
    const startDate = bulletin.startAt 
        ? parseISO(bulletin.startAt) 
        : (bulletin.date ? parse(bulletin.date, 'yyyy-MM-dd', new Date()) : null);
    if (!startDate) return false;
    const diff = differenceInHours(startDate, now);
    return diff >= 0 && diff <= 24;
}

interface BulletinsState {
  bulletins: Bulletin[];
  addBulletin: (bulletin: Omit<Bulletin, 'id' | 'createdAt'>) => void;
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
      getActiveBulletins: (now: Date, audienceFilter: Audience = 'students') => {
          const allItems = get().bulletins.filter(b => b.type !== 'quote'); // Exclude quotes from main source
          
          const active = allItems.filter(b => {
              if (!audienceMatches(b.audience, audienceFilter)) return false;
              if (!isInWindow(b, now)) return false;
              return true;
          });

          active.sort((a, b) => {
              if (a.priority === 'high' && b.priority !== 'high') return -1;
              if (b.priority === 'high' && a.priority !== 'high') return 1;

              const aIsSoon = isStartingSoon(a, now);
              const bIsSoon = isStartingSoon(b, now);
              if (aIsSoon && !bIsSoon) return -1;
              if (bIsSoon && !aIsSoon) return 1;
              
              return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
          });
          
          return active;
      }
    }),
    {
      name: 'nava-bulletins-store',
      partialize: (state) => ({ bulletins: state.bulletins }),
    }
  )
);

export default useBulletinsStore;