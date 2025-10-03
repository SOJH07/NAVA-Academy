import type { ReactElement } from 'react';

export interface AcademicRecord {
  year: string;
  stage: 'Foundation' | 'Year 2';
  techGroup: string;
}

export interface Student {
  navaId: number;
  name: string;
  surname: string;
  academicHistory: AcademicRecord[];
  company: 'Ceer' | 'Lucid';
  email: string;
  program: string;
}

export interface DailyPeriod {
  name: string;
  start: string;
  end: string;
  type: 'class' | 'break';
}

export interface AptisScoreDetail {
  score: number;
  cefr?: string;
}

export interface AptisScores {
  overall: AptisScoreDetail;
  grammarAndVocabulary: AptisScoreDetail;
  listening: AptisScoreDetail;
  reading: AptisScoreDetail;
  speaking: AptisScoreDetail;
  writing: AptisScoreDetail;
}

export interface FoundationGrades {
    englishUnit1: number | null;
    englishUnit2: number | null;
    navaEnglishAverage: number | null;
    englishFinalGrade: string | null;
    nava001: string | null;
    nava002: string | null;
    nava003: string | null;
    nava004: string | null;
    nava005: string | null;
    nava006: string | null;
    nava007: string | null;
    nava008: string | null;
}

export type Year2Grades = Record<string, string | null>;

// FIX: Changed StudentGrades to extend FoundationGrades to flatten the structure,
// resolving type mismatches in data files and hooks.
export interface StudentGrades extends FoundationGrades {
    year2?: Year2Grades;
}


export interface GroupInfo {
  [key:string]: {
    schedule_type: string;
    curriculum_name: string;
    track_name: string;
  };
}

export interface FloorPlanItem {
  name: string;
  type: 'classroom' | 'static' | 'lab' | 'workshop';
  gridColumn: string;
  gridRow: string;
  capacity?: number;
}

export interface Page {
    id: string;
    label: string;
    icon: ReactElement;
}

export interface EnhancedStudent extends Student {
  fullName: string;
  trackName: string;
  techScheduleType: string;
  techGroup: string; // The CURRENT tech group
  aptisScores?: AptisScores;
  grades?: StudentGrades;
}

export interface BenchmarkAverages {
    gpa: number;
    nava: number;
    aptis: number;
}


export interface AnalyzedStudent extends EnhancedStudent {
  navaAverageScore: number | null;
  ucCount: number;
  distinctionCount: number;
  performanceSegment: 'High Achievers' | 'Technically Strong' | 'Linguistically Strong' | 'Needs Support' | 'Standard';
  gpa: number | null;
  combinedEnglishAverage: number | null;
  benchmark?: {
      group: BenchmarkAverages;
      academy: BenchmarkAverages;
  }
}

export interface LiveStudent extends AnalyzedStudent {
  location: string;
  status: 'In Class' | 'Break' | 'Finished' | 'Upcoming';
  currentPeriod: string;
}

export interface OccupancyData {
    [key: string]: {
        group: string;
        type: 'industrial' | 'service' | 'professional';
    } | undefined
}

export interface LiveClass {
    group: string;
    type: 'industrial' | 'service' | 'professional';
    classroom: string;
}

export interface GroupSchedule {
    group_name: string;
    schedule_type: string;
}

export interface Curriculum {
    group_name: string;
    curriculum_name: string;
    track_name: string;
}

export type ClassroomStatusType = 'available' | 'occupied' | 'out-of-service';

export interface ClassroomStatus {
    status: ClassroomStatusType;
    reason?: string;
}

export interface ClassroomState {
    [classroomName: string]: ClassroomStatus;
}

export interface CalendarEvent {
  event: string;
  start: string;
  end: string;
  type: 'CH' | 'NAVA' | 'National' | 'Ramadan' | 'Eid' | 'Annual' | 'Instructor' | 'Facility';
  color: string;
  category?: string;
}

export interface CalendarLayer {
  id: string;
  label: string;
  color: string;
}

export interface ProcessedCalendarEvent extends CalendarEvent {
  id: string; // Unique ID for key and hover state
  left: number;
  width: number;
  top: number;
  isMilestone: boolean;
  isInProgress: boolean;
  duration: number; // in days
}

export interface ProcessedGridEvent extends CalendarEvent {
  id: string; // Unique ID for key
  lane: number; // Vertical stacking lane
  startCol: number; // Grid column start (1-7)
  span: number; // How many columns it spans
  startsInWeek: boolean; // For rounded corners
  endsInWeek: boolean; // For rounded corners
}

export interface Assignment {
  id: number;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';
  group: string;
  classroom: string;
  instructors: string[];
  topic: string;
  type: 'Technical' | 'Professional Development';
}

export type LiveOpsFilters = {
    status: 'all' | 'live' | 'not-live';
    companies: string[];
    techTracks: string[];
    techGroups: string[];
    classrooms: string[];
    aptisCEFRLevels: string[];
    sessionType: 'all' | 'tech' | 'professional';
    technicalGrades: string[];
    performanceSegments: string[];
    gpaRange: [number, number];
};

export type FloorId = 'ground' | 'first' | 'second' | 'third' | 'incubator';

export type FocusedPath = { type: 'group' | 'instructor', id: string } | null;