import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ClassInfo, CustomExclusions } from '../types';

interface ScheduleSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  classes: ClassInfo[];
  setClasses: React.Dispatch<React.SetStateAction<ClassInfo[]>>;
  customExclusions: CustomExclusions;
  setCustomExclusions: React.Dispatch<React.SetStateAction<CustomExclusions>>;
}

export const ScheduleSettingModal: React.FC<ScheduleSettingModalProps> = ({
  isOpen,
  onClose,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  classes,
  setClasses,
  customExclusions,
  setCustomExclusions,
}) => {
  const [newExclusionDate, setNewExclusionDate] = useState('');
  const [newExclusionName, setNewExclusionName] = useState('');

  if (!isOpen) return null;

  const handleAddExclusion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExclusionDate || !newExclusionName.trim()) return;
    setCustomExclusions((prev) => ({
      ...prev,
      [newExclusionDate]: newExclusionName.trim(),
    }));
    setNewExclusionDate('');
    setNewExclusionName('');
  };

  const handleRemoveExclusion = (dateKey: string) => {
    setCustomExclusions((prev) => {
      const copy = { ...prev };
      delete copy[dateKey];
      return copy;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">학사 일정 및 분반 시간표 설정</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Semester Date Range */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              학기 운영 기간 설정
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">학기 시작일</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">학기 종료일</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Custom Holiday / School Events */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              재량휴업일 / 특별 학교 행사 등록 (수업 제외일)
            </h3>
            
            {/* Add Exclusion Form */}
            <form onSubmit={handleAddExclusion} className="flex flex-col sm:flex-row items-center gap-2 mb-3">
              <input 
                type="date"
                value={newExclusionDate}
                onChange={(e) => setNewExclusionDate(e.target.value)}
                className="w-full sm:w-40 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-600"
              />
              <input 
                type="text"
                value={newExclusionName}
                onChange={(e) => setNewExclusionName(e.target.value)}
                placeholder="행사명 (예: 개교기념일, 축제, 체육대회)"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                등록
              </button>
            </form>

            {/* Custom Exclusions List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 max-h-36 overflow-y-auto">
              {Object.keys(customExclusions).length === 0 ? (
                <div className="text-slate-400 text-center py-2 text-[11px]">
                  등록된 특별 행사/휴업일이 없습니다.
                </div>
              ) : (
                Object.entries(customExclusions).map(([dStr, name]) => (
                  <div key={dStr} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{dStr}</span>
                      <span className="text-indigo-600 font-semibold">{name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveExclusion(dStr)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Class Schedule Overview */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              분반별 주간 수업 시간표 현황
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      cls.id === 'P' ? 'bg-indigo-600' :
                      cls.id === 'R' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}></span>
                    {cls.name}
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {['월', '화', '수', '목', '금'].map((dayName, idx) => {
                      const dayNum = idx + 1;
                      const periods = cls.schedule[dayNum];
                      return (
                        <li key={dayNum} className="flex items-center justify-between">
                          <span className="font-semibold text-slate-500">{dayName}요일:</span>
                          <span className="font-bold text-slate-800">
                            {periods && periods.length > 0 ? periods.join(', ') : '-'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
