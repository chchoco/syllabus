import React from 'react';
import { 
  Printer, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';
import { ClassInfo, ClassStat } from '../types';

interface HeaderProps {
  schoolYear: string;
  setSchoolYear: (val: string) => void;
  subjectName: string;
  setSubjectName: (val: string) => void;
  teacherName: string;
  setTeacherName: (val: string) => void;
  activeTab: 'plan' | 'tracking';
  setActiveTab: (tab: 'plan' | 'tracking') => void;
  classes: ClassInfo[];
  classStats: Record<string, ClassStat>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string;
  onPrint: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onApplyTemplate: () => void;
  onOpenSettings: () => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolYear,
  setSchoolYear,
  subjectName,
  setSubjectName,
  teacherName,
  setTeacherName,
  activeTab,
  setActiveTab,
  classes,
  classStats,
  saveStatus,
  lastSavedAt,
  onPrint,
  onExport,
  onImport,
  onReset,
  onApplyTemplate,
  onOpenSettings,
  selectedMonth,
  setSelectedMonth
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="no-print bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4 transition-all">
      {/* Top Bar: Subject Title, Teacher, Save Indicator, Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        
        {/* Left: Title & Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 text-white text-xs font-bold px-2.5 py-1 rounded-md transition-all outline-none text-center cursor-pointer"
              title="클릭하여 학년도 수정"
            />
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="text-xl">📘</span>
              <input 
                type="text"
                id="header-subject-name-input"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="text-lg md:text-xl font-black text-slate-900 border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none bg-transparent px-1 py-0.5"
                placeholder="과목명"
                title="클릭하여 과목명 수정"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span>담당:</span>
            <input 
              type="text"
              id="header-teacher-name-input"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="font-semibold text-slate-700 bg-transparent border-b border-slate-300 focus:border-indigo-600 outline-none w-24 text-center px-1"
              placeholder="교사명"
            />
          </div>

          {/* Cloud Database Sync Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs" title={lastSavedAt ? `클라우드 DB 동기화 완료: ${new Date(lastSavedAt).toLocaleTimeString()}` : '클라우드 DB 실시간 동기화 상태'}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span className="text-indigo-700 font-bold">클라우드 동기화 중...</span>
              </>
            ) : saveStatus === 'error' ? (
              <span className="text-rose-600 font-bold">로컬 저장됨 (오프라인)</span>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">클라우드 DB 실시간 동기화</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI / Template Preset Button */}
          <button 
            id="btn-apply-template"
            onClick={onApplyTemplate}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="인공지능 기초 과목 표준 69차시 교육과정 진도 템플릿 자동 채우기"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>표준 계획 템플릿</span>
          </button>

          <button 
            id="btn-schedule-settings"
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="학사 일정 및 시간표 설정"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>일정/분반 설정</span>
          </button>

          <button 
            id="btn-print-pdf"
            onClick={onPrint}
            className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF</span>
          </button>

          <button 
            id="btn-export-backup"
            onClick={onExport}
            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="진도표 데이터 JSON 백업 파일로 내보내기"
          >
            <Download className="w-3.5 h-3.5" />
            <span>백업</span>
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onImport} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            id="btn-import-backup"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="이전에 백업한 JSON 파일 불러오기"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>불러오기</span>
          </button>

          <button 
            id="btn-reset-data"
            onClick={onReset}
            className="px-2.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            title="초기 상태로 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Class Stats */}
      <div className="mt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            id="tab-btn-plan"
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>주차별 통합 진도 계획표</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'plan' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
            }`}>
              공통 69차시
            </span>
          </button>

          <button
            id="tab-btn-tracking"
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>분반별 실제 진도 기록표</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'tracking' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
            }`}>
              P · R · S반
            </span>
          </button>
        </div>

        {/* Tracking View Month Filter & Class Progress Badges */}
        {activeTab === 'tracking' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {['ALL', '08', '09', '10', '11', '12'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                    selectedMonth === m 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'ALL' ? '전체' : `${parseInt(m)}월`}
                </button>
              ))}
            </div>

            {/* Class Stats Summary */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs overflow-x-auto">
              {classes.map((cls, idx) => {
                const st = classStats[cls.id] || { midtermDone: 0, midtermTotal: 0, finalDone: 0, finalTotal: 0, percentage: 0 };
                return (
                  <div key={cls.id} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        cls.id === 'P' ? 'bg-indigo-600' :
                        cls.id === 'R' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}></span>
                      {cls.name}
                    </span>
                    <span className="text-slate-600">
                      중간 <strong className="text-indigo-700">{st.midtermDone}/{st.midtermTotal}</strong>
                      <span className="mx-1 text-slate-300">·</span>
                      기말 <strong className="text-emerald-700">{st.finalDone}/{st.finalTotal}</strong>
                      <span className="ml-1 text-[11px] font-bold text-slate-800">({st.percentage}%)</span>
                    </span>
                    {idx < classes.length - 1 && <span className="text-slate-300">|</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
