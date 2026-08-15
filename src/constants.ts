import { ClassInfo } from './types';

export const EXAM_DATES: Record<string, { name: string; type: 'exam' }> = {
  '2026-10-01': { name: '중간고사 (1일차)', type: 'exam' },
  '2026-10-02': { name: '중간고사 (2일차)', type: 'exam' },
  '2026-10-06': { name: '중간고사 (3일차)', type: 'exam' },
  '2026-10-07': { name: '중간고사 (4일차)', type: 'exam' },
  '2026-12-03': { name: '기말고사 (1일차)', type: 'exam' },
  '2026-12-04': { name: '기말고사 (2일차)', type: 'exam' },
  '2026-12-07': { name: '기말고사 (3일차)', type: 'exam' },
  '2026-12-08': { name: '기말고사 (4일차)', type: 'exam' },
};

export const HOLIDAYS: Record<string, string> = {
  '2026-08-15': '광복절',
  '2026-08-17': '광복절 대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-09-28': '추석 대체공휴일',
  '2026-10-03': '개천절',
  '2026-10-05': '개천절 대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
};

export const MOCK_EXAMS: Record<string, string> = {
  '2026-09-02': '9월 전국연합모의고사',
  '2026-10-13': '10월 전국연합모의고사',
};

export const INITIAL_CLASSES: ClassInfo[] = [
  { id: 'P', name: 'P반', color: 'indigo', schedule: { 1: ['4교시'], 2: ['7교시'], 3: ['3교시'], 5: ['6교시'] } },
  { id: 'R', name: 'R반', color: 'emerald', schedule: { 1: ['6교시'], 3: ['1교시'], 4: ['7교시'], 5: ['4교시'] } },
  { id: 'S', name: 'S반', color: 'amber', schedule: { 2: ['2교시', '3교시'], 4: ['2교시', '3교시'] } }
];

export const INITIAL_DATA = {
  subjectName: '인공지능기초',
  teacherName: '홍길동 교사',
  schoolYear: '2026학년도 2학기',
  startDate: '2026-08-10',
  endDate: '2026-12-31',
  classes: INITIAL_CLASSES,
  progressData: {},
  planData: {},
  customExclusions: {}
};
