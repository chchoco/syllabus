export interface ClassSchedule {
  [dayOfWeek: number]: string[]; // 1: Monday, 2: Tuesday, etc.
}

export interface ClassInfo {
  id: string; // 'P' | 'R' | 'S'
  name: string;
  color: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
  schedule: ClassSchedule;
}

export interface PlanItem {
  unit?: string;
  topic?: string;
  note?: string;
}

export interface PlanData {
  [chasiNumber: number]: PlanItem;
}

export interface DateEntry {
  topic?: string;
  checked?: boolean;
  [key: `topic_${number}`]: string | undefined;
  [key: `checked_${number}`]: boolean | undefined;
}

export interface ProgressData {
  [classId: string]: {
    [dateStr: string]: DateEntry;
  };
}

export interface CustomExclusions {
  [dateStr: string]: string; // custom event name
}

export interface AppDatabaseState {
  subjectName: string;
  teacherName: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
  classes: ClassInfo[];
  progressData: ProgressData;
  planData: PlanData;
  customExclusions: CustomExclusions;
  lastSavedAt?: string;
}

export interface DateRowInfo {
  dateStr: string;
  dayOfWeek: number;
  dayName: string;
  monthStr: string;
  weekNumber: number;
  isNewWeek: boolean;
  eventNote: string | null;
  eventType: 'EXAM' | 'HOLIDAY' | 'MOCK' | 'CUSTOM' | null;
}

export interface ClassStat {
  midtermTotal: number;
  midtermDone: number;
  midtermPct: number;
  finalTotal: number;
  finalDone: number;
  finalPct: number;
  totalSessions: number;
  completedSessions: number;
  percentage: number;
}
