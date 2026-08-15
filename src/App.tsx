import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  fetchProgressDatabase, 
  saveProgressDatabase, 
  resetProgressDatabase 
} from './services/api';
import { 
  AppDatabaseState, 
  ClassInfo, 
  ClassStat, 
  DateRowInfo, 
  PlanData, 
  ProgressData, 
  CustomExclusions 
} from './types';
import { 
  EXAM_DATES, 
  HOLIDAYS, 
  MOCK_EXAMS, 
  INITIAL_CLASSES, 
  INITIAL_DATA 
} from './constants';
import { AI_BASIC_STANDARD_TEMPLATE } from './utils/templateData';
import { Header } from './components/Header';
import { IntegratedPlanView } from './components/IntegratedPlanView';
import { ClassTrackingView } from './components/ClassTrackingView';
import { PrintView } from './components/PrintView';
import { ScheduleSettingModal } from './components/ScheduleSettingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'plan' | 'tracking'>('plan');
  const [subjectName, setSubjectName] = useState(INITIAL_DATA.subjectName);
  const [teacherName, setTeacherName] = useState(INITIAL_DATA.teacherName);
  const [schoolYear, setSchoolYear] = useState(INITIAL_DATA.schoolYear);
  const [startDate, setStartDate] = useState(INITIAL_DATA.startDate);
  const [endDate, setEndDate] = useState(INITIAL_DATA.endDate);

  const [classes, setClasses] = useState<ClassInfo[]>(INITIAL_CLASSES);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [planData, setPlanData] = useState<PlanData>({});
  const [customExclusions, setCustomExclusions] = useState<CustomExclusions>({});
  
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Database Save Status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();
  const isInitialLoaded = useRef(false);
  const saveTimeoutRef = useRef<any>(null);

  // 1. Initial Load from Database API / Cache
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProgressDatabase();
        if (data) {
          if (data.subjectName) setSubjectName(data.subjectName);
          if (data.teacherName) setTeacherName(data.teacherName);
          if (data.schoolYear) setSchoolYear(data.schoolYear);
          if (data.startDate) setStartDate(data.startDate);
          if (data.endDate) setEndDate(data.endDate);
          if (data.classes && data.classes.length > 0) setClasses(data.classes);
          if (data.progressData) setProgressData(data.progressData);
          if (data.planData) setPlanData(data.planData);
          if (data.customExclusions) setCustomExclusions(data.customExclusions);
          if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt);
        }
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        isInitialLoaded.current = true;
      }
    }
    loadData();
  }, []);

  // 2. Auto-save to Database when state changes (debounced by 600ms)
  useEffect(() => {
    if (!isInitialLoaded.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(async () => {
      const payload: AppDatabaseState = {
        subjectName,
        teacherName,
        schoolYear,
        startDate,
        endDate,
        classes,
        progressData,
        planData,
        customExclusions,
      };

      const result = await saveProgressDatabase(payload);
      if (result.success) {
        setSaveStatus('saved');
        if (result.lastSavedAt) setLastSavedAt(result.lastSavedAt);
      } else {
        setSaveStatus('error');
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [subjectName, teacherName, schoolYear, startDate, endDate, classes, progressData, planData, customExclusions]);

  // Date Formatting Helpers
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (d: Date) => ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

  // Generate Full Date List
  const fullDateList: DateRowInfo[] = useMemo(() => {
    const list: DateRowInfo[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    let currentWeek = 1;

    while (curr <= end) {
      const dayOfWeek = curr.getDay();
      const dateStr = formatDate(curr);

      // Only weekdays (Monday to Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const monthStr = String(curr.getMonth() + 1).padStart(2, '0');

        let isNewWeek = false;
        if (dayOfWeek === 1 || list.length === 0) {
          if (list.length > 0 && dayOfWeek === 1) {
            currentWeek++;
          }
          isNewWeek = true;
        }

        let eventNote: string | null = null;
        let eventType: 'EXAM' | 'HOLIDAY' | 'MOCK' | 'CUSTOM' | null = null;

        if (EXAM_DATES[dateStr]) {
          eventNote = EXAM_DATES[dateStr].name;
          eventType = 'EXAM';
        } else if (HOLIDAYS[dateStr]) {
          eventNote = HOLIDAYS[dateStr];
          eventType = 'HOLIDAY';
        } else if (MOCK_EXAMS[dateStr]) {
          eventNote = MOCK_EXAMS[dateStr];
          eventType = 'MOCK';
        } else if (customExclusions[dateStr]) {
          eventNote = customExclusions[dateStr];
          eventType = 'CUSTOM';
        }

        list.push({
          dateStr,
          dayOfWeek,
          dayName: getDayName(curr),
          monthStr,
          weekNumber: currentWeek,
          isNewWeek,
          eventNote,
          eventType,
        });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return list;
  }, [startDate, endDate, customExclusions]);

  // Filtered Date List by selected month
  const dateList = useMemo(() => {
    if (selectedMonth === 'ALL') return fullDateList;
    return fullDateList.filter((d) => d.monthStr === selectedMonth);
  }, [fullDateList, selectedMonth]);

  // Cumulative Chasi Mapping per Class (수업이 있는 날짜/교시별로 1차시, 2차시... 자동 부여)
  const classChasiMap = useMemo(() => {
    const map: Record<string, Record<string, Record<number, number>>> = {};
    const counters: Record<string, number> = { P: 0, R: 0, S: 0 };
    classes.forEach((c) => {
      map[c.id] = {};
    });

    fullDateList.forEach((d) => {
      if (d.eventNote) return; // 수업 없는 날 제외
      classes.forEach((cls) => {
        const periods = cls.schedule[d.dayOfWeek];
        if (periods && periods.length > 0) {
          if (!map[cls.id][d.dateStr]) {
            map[cls.id][d.dateStr] = {};
          }
          periods.forEach((_, pIdx) => {
            counters[cls.id] = (counters[cls.id] || 0) + 1;
            map[cls.id][d.dateStr][pIdx] = counters[cls.id];
          });
        }
      });
    });
    return map;
  }, [classes, fullDateList]);

  // Class Statistics (중간/기말/전체 진도율 및 완료 시수)
  const classStats: Record<string, ClassStat> = useMemo(() => {
    const stats: Record<string, ClassStat> = {};
    classes.forEach((cls) => {
      let midtermTotal = 0, midtermDone = 0;
      let finalTotal = 0, finalDone = 0;
      let totalSessions = 0, completedSessions = 0;

      fullDateList.forEach((d) => {
        const periods = cls.schedule[d.dayOfWeek];
        if (periods && !d.eventNote) {
          const isMidtermPeriod = d.dateStr < '2026-10-01';
          const isFinalPeriod = d.dateStr > '2026-10-07' && d.dateStr < '2026-12-03';

          periods.forEach((_, idx) => {
            totalSessions++;
            const entry = progressData[cls.id]?.[d.dateStr];
            const isChecked =
              entry?.[`checked_${idx}`] !== undefined
                ? entry[`checked_${idx}`]
                : idx === 0
                ? !!entry?.checked
                : false;

            if (isMidtermPeriod) {
              midtermTotal++;
              if (isChecked) midtermDone++;
            } else if (isFinalPeriod) {
              finalTotal++;
              if (isChecked) finalDone++;
            }

            if (isChecked) completedSessions++;
          });
        }
      });

      stats[cls.id] = {
        midtermTotal,
        midtermDone,
        midtermPct: midtermTotal > 0 ? Math.round((midtermDone / midtermTotal) * 100) : 0,
        finalTotal,
        finalDone,
        finalPct: finalTotal > 0 ? Math.round((finalDone / finalTotal) * 100) : 0,
        totalSessions,
        completedSessions,
        percentage: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      };
    });
    return stats;
  }, [classes, fullDateList, progressData]);

  // Weekly Integrated Plan Structure (69 차시 기준)
  const weeklyPlans = useMemo(() => {
    const weeksMap: Record<number, {
      weekNumber: number;
      startDate: string;
      endDate: string;
      hasExam: boolean;
      examName: string | null;
      dates: DateRowInfo[];
    }> = {};

    fullDateList.forEach((d) => {
      if (!weeksMap[d.weekNumber]) {
        weeksMap[d.weekNumber] = {
          weekNumber: d.weekNumber,
          startDate: d.dateStr,
          endDate: d.dateStr,
          hasExam: false,
          examName: null,
          dates: [],
        };
      }
      weeksMap[d.weekNumber].endDate = d.dateStr;
      weeksMap[d.weekNumber].dates.push(d);
      if (d.eventType === 'EXAM') {
        weeksMap[d.weekNumber].hasExam = true;
        weeksMap[d.weekNumber].examName = d.eventNote;
      }
    });

    let chasiCounter = 1;
    const weekList = Object.values(weeksMap).map((w) => {
      let plannedCount = 4; // 보통 주당 4차시
      if (w.hasExam) {
        plannedCount = 0; // 시험 주간은 차시 제외
      }

      const chasiList: number[] = [];
      for (let i = 0; i < plannedCount && chasiCounter <= 69; i++) {
        chasiList.push(chasiCounter);
        chasiCounter++;
      }

      return {
        ...w,
        chasiList,
      };
    });

    return weekList;
  }, [fullDateList]);

  // Plan Handlers
  const handlePlanChange = useCallback((chasi: number, field: 'unit' | 'topic' | 'note', value: string) => {
    setPlanData((prev) => ({
      ...prev,
      [chasi]: {
        ...(prev[chasi] || {}),
        [field]: value,
      },
    }));
  }, []);

  // Tracking Handlers
  const handleTopicChange = useCallback((classId: string, dateStr: string, periodIndex: number, value: string) => {
    setProgressData((prev) => {
      const classObj = prev[classId] || {};
      const dateEntry = classObj[dateStr] || {};
      return {
        ...prev,
        [classId]: {
          ...classObj,
          [dateStr]: {
            ...dateEntry,
            [`topic_${periodIndex}`]: value,
          },
        },
      };
    });
  }, []);

  const handleToggleCheck = useCallback((classId: string, dateStr: string, periodIndex: number) => {
    setProgressData((prev) => {
      const classObj = prev[classId] || {};
      const dateEntry = classObj[dateStr] || {};
      const currentKey = `checked_${periodIndex}`;
      const currentChecked =
        dateEntry[currentKey] !== undefined
          ? dateEntry[currentKey]
          : periodIndex === 0
          ? !!dateEntry.checked
          : false;

      return {
        ...prev,
        [classId]: {
          ...classObj,
          [dateStr]: {
            ...dateEntry,
            [currentKey]: !currentChecked,
          },
        },
      };
    });
  }, []);

  // Fill single topic from plan
  const handleFillFromPlan = useCallback((classId: string, dateStr: string, periodIndex: number, chasiNum: number) => {
    const planItem = planData[chasiNum];
    if (planItem && planItem.topic) {
      handleTopicChange(classId, dateStr, periodIndex, planItem.topic);
    }
  }, [planData, handleTopicChange]);

  // Fill all classes from plan
  const handleFillAllFromPlan = useCallback(() => {
    if (!window.confirm('계획표의 차시별 학습 내용을 각 분반의 비어있는 진도란에 일괄 복사하시겠습니까?')) {
      return;
    }

    setProgressData((prev) => {
      const nextProgress = JSON.parse(JSON.stringify(prev));

      classes.forEach((cls) => {
        if (!nextProgress[cls.id]) nextProgress[cls.id] = {};

        fullDateList.forEach((d) => {
          if (d.eventNote) return;
          const periods = cls.schedule[d.dayOfWeek];
          if (periods && periods.length > 0) {
            if (!nextProgress[cls.id][d.dateStr]) {
              nextProgress[cls.id][d.dateStr] = {};
            }

            periods.forEach((_, pIdx) => {
              const chasiNum = classChasiMap[cls.id]?.[d.dateStr]?.[pIdx];
              const planItem = chasiNum ? planData[chasiNum] : undefined;
              const currentTopic = nextProgress[cls.id][d.dateStr][`topic_${pIdx}`];

              if (planItem?.topic && !currentTopic) {
                nextProgress[cls.id][d.dateStr][`topic_${pIdx}`] = planItem.topic;
              }
            });
          }
        });
      });

      return nextProgress;
    });
  }, [classes, fullDateList, classChasiMap, planData]);

  // Apply Standard AI Curriculum Template
  const handleApplyTemplate = useCallback(() => {
    if (
      window.confirm(
        '인공지능 기초 과목의 표준 69차시 교육과정 진도 계획 템플릿을 적용하시겠습니까?\n(기존 입력된 계획표 내용이 표준 계획으로 채워집니다.)'
      )
    ) {
      setPlanData(AI_BASIC_STANDARD_TEMPLATE);
    }
  }, []);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    const payload = {
      subjectName,
      teacherName,
      schoolYear,
      startDate,
      endDate,
      classes,
      progressData,
      planData,
      customExclusions,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${subjectName}_진도계획표_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }, [subjectName, teacherName, schoolYear, startDate, endDate, classes, progressData, planData, customExclusions]);

  // Import JSON
  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed) {
          if (parsed.subjectName) setSubjectName(parsed.subjectName);
          if (parsed.teacherName) setTeacherName(parsed.teacherName);
          if (parsed.schoolYear) setSchoolYear(parsed.schoolYear);
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.endDate) setEndDate(parsed.endDate);
          if (parsed.classes) setClasses(parsed.classes);
          if (parsed.progressData) setProgressData(parsed.progressData);
          if (parsed.planData) setPlanData(parsed.planData);
          if (parsed.customExclusions) setCustomExclusions(parsed.customExclusions);
          alert('백업 파일 데이터를 성공적으로 불러왔습니다!');
        }
      } catch (err) {
        alert('올바른 JSON 파일 형식이 아닙니다.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  }, []);

  // Reset to default
  const handleReset = useCallback(async () => {
    if (window.confirm('모든 진도 기록 및 계획표를 정말로 초기화하시겠습니까? (되돌릴 수 없습니다)')) {
      const resetData = await resetProgressDatabase();
      setSubjectName(resetData.subjectName);
      setTeacherName(resetData.teacherName);
      setSchoolYear(resetData.schoolYear);
      setStartDate(resetData.startDate);
      setEndDate(resetData.endDate);
      setClasses(resetData.classes);
      setProgressData({});
      setPlanData({});
      setCustomExclusions({});
    }
  }, []);

  return (
    <div className="max-w-[1680px] mx-auto px-2.5 sm:px-4 py-3 min-h-screen text-slate-800 antialiased font-sans">
      {/* Header with Navigation & DB Status */}
      <Header
        schoolYear={schoolYear}
        setSchoolYear={setSchoolYear}
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        teacherName={teacherName}
        setTeacherName={setTeacherName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classes={classes}
        classStats={classStats}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        onPrint={() => window.print()}
        onExport={handleExportJSON}
        onImport={handleImportJSON}
        onReset={handleReset}
        onApplyTemplate={handleApplyTemplate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      {/* Main Tab 1: Integrated Plan View */}
      {activeTab === 'plan' && (
        <IntegratedPlanView
          weeklyPlans={weeklyPlans}
          planData={planData}
          onPlanChange={handlePlanChange}
          onApplyTemplate={handleApplyTemplate}
        />
      )}

      {/* Main Tab 2: Class Tracking View */}
      {activeTab === 'tracking' && (
        <ClassTrackingView
          dateList={dateList}
          classes={classes}
          progressData={progressData}
          planData={planData}
          classChasiMap={classChasiMap}
          onTopicChange={handleTopicChange}
          onToggleCheck={handleToggleCheck}
          onFillFromPlan={handleFillFromPlan}
          onFillAllFromPlan={handleFillAllFromPlan}
        />
      )}

      {/* Print View (Only visible during window.print()) */}
      <PrintView
        activeTab={activeTab}
        schoolYear={schoolYear}
        subjectName={subjectName}
        teacherName={teacherName}
        weeklyPlans={weeklyPlans}
        planData={planData}
        dateList={dateList}
        classes={classes}
        progressData={progressData}
        classChasiMap={classChasiMap}
      />

      {/* Schedule and Class Settings Modal */}
      <ScheduleSettingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        classes={classes}
        setClasses={setClasses}
        customExclusions={customExclusions}
        setCustomExclusions={setCustomExclusions}
      />
    </div>
  );
}
