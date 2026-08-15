import React, { useState } from 'react';
import { PlanData } from '../types';
import { Search, Sparkles, Filter } from 'lucide-react';

interface WeeklyPlanItem {
  weekNumber: number;
  startDate: string;
  endDate: string;
  hasExam: boolean;
  examName: string | null;
  chasiList: number[];
}

interface IntegratedPlanViewProps {
  weeklyPlans: WeeklyPlanItem[];
  planData: PlanData;
  onPlanChange: (chasi: number, field: 'unit' | 'topic' | 'note', value: string) => void;
  onApplyTemplate: () => void;
}

export const IntegratedPlanView: React.FC<IntegratedPlanViewProps> = ({
  weeklyPlans,
  planData,
  onPlanChange,
  onApplyTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'ALL' | 'MID' | 'FINAL' | 'END'>('ALL');

  // Filter chasi based on search or range
  const isChasiVisible = (chasiNum: number) => {
    if (rangeFilter === 'MID' && chasiNum > 25) return false;
    if (rangeFilter === 'FINAL' && (chasiNum < 26 || chasiNum > 55)) return false;
    if (rangeFilter === 'END' && chasiNum < 56) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const item = planData[chasiNum] || {};
    const unit = (item.unit || '').toLowerCase();
    const topic = (item.topic || '').toLowerCase();
    const note = (item.note || '').toLowerCase();
    const chasiStr = `${chasiNum}차시`;

    return unit.includes(term) || topic.includes(term) || note.includes(term) || chasiStr.includes(term);
  };

  return (
    <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print transition-all">
      {/* Sub Header / Action Bar */}
      <div className="px-4 py-3 bg-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-amber-400 text-indigo-950 px-2 py-0.5 rounded font-black text-xs">
            📌 주차별 공통 진도 (총 69차시)
          </span>
          <span className="text-indigo-200">
            중간고사: <strong className="text-white">1~25차시</strong> · 기말고사: <strong className="text-white">26~55차시</strong> · 학기말: <strong className="text-white">56~69차시</strong>
          </span>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-indigo-900/80 p-0.5 rounded-lg border border-indigo-800">
            <button
              onClick={() => setRangeFilter('ALL')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                rangeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setRangeFilter('MID')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                rangeFilter === 'MID' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              중간범위 (1~25)
            </button>
            <button
              onClick={() => setRangeFilter('FINAL')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                rangeFilter === 'FINAL' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              기말범위 (26~55)
            </button>
            <button
              onClick={() => setRangeFilter('END')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                rangeFilter === 'END' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'
              }`}
            >
              학기말 (56~69)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-indigo-300" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="단원 또는 학습내용 검색..."
              className="bg-indigo-900/90 text-white placeholder:text-indigo-300/70 text-xs pl-8 pr-2.5 py-1 rounded-lg border border-indigo-700 focus:outline-none focus:border-amber-400 w-44 md:w-52"
            />
          </div>
        </div>
      </div>

      {/* Plan Table */}
      <div className="overflow-x-auto table-scroll max-h-[calc(100vh-210px)]">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold sticky top-0 z-20 border-b border-slate-300 shadow-xs">
            <tr>
              <th className="py-2.5 px-3 w-28 bg-slate-100 border-r border-slate-300 text-center">주차 / 기간</th>
              <th className="py-2.5 px-3 w-24 border-r border-slate-300 text-center">차시</th>
              <th className="py-2.5 px-3 w-56 md:w-64 border-r border-slate-300">대단원 / 중단원</th>
              <th className="py-2.5 px-3 border-r border-slate-300">주요 학습 내용 및 수업 활동</th>
              <th className="py-2.5 px-3 w-44">비고 / 교재</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {weeklyPlans.map((weekObj) => {
              const { weekNumber, startDate, endDate, hasExam, examName, chasiList } = weekObj;

              if (hasExam) {
                return (
                  <tr key={`week-${weekNumber}`} className="border-t-4 border-indigo-600 bg-rose-50/70">
                    <td className="py-2.5 px-3 text-center font-bold border-r border-slate-300 bg-rose-100/50 whitespace-nowrap">
                      <div className="text-xs text-indigo-950 font-black">{weekNumber}주차</div>
                      <div className="text-[10px] text-slate-500 font-medium">{startDate.slice(5)} ~ {endDate.slice(5)}</div>
                    </td>
                    <td colSpan={4} className="py-3 px-4 text-center text-rose-700 font-extrabold text-xs">
                      🚨 {examName} 주간 (정규 수업 차시 제외)
                    </td>
                  </tr>
                );
              }

              const visibleChasis = chasiList.filter(c => isChasiVisible(c));
              if (visibleChasis.length === 0 && chasiList.length > 0) return null;

              return chasiList.map((chasiNum, idx) => {
                if (!isChasiVisible(chasiNum)) return null;

                const planItem = planData[chasiNum] || {};
                const isMidtermEnd = chasiNum === 25;
                const isFinalEnd = chasiNum === 55;

                return (
                  <tr 
                    key={`chasi-${chasiNum}`}
                    className={`hover:bg-indigo-50/30 transition-colors ${
                      idx === 0 ? 'week-divider' : ''
                    } ${
                      isMidtermEnd ? 'bg-indigo-50/60 border-b-4 border-indigo-500' : ''
                    } ${
                      isFinalEnd ? 'bg-emerald-50/60 border-b-4 border-emerald-500' : ''
                    }`}
                  >
                    {idx === 0 && (
                      <td 
                        rowSpan={chasiList.length} 
                        className="py-2.5 px-3 text-center font-bold border-r border-slate-300 bg-slate-50/80 align-top whitespace-nowrap"
                      >
                        <div className="inline-block bg-indigo-100 text-indigo-900 font-black text-xs px-2.5 py-1 rounded-md mb-1 shadow-2xs">
                          {weekNumber}주차
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {startDate.slice(5)} ~ {endDate.slice(5)}
                        </div>
                      </td>
                    )}

                    {/* Chasi Badge */}
                    <td className="py-1.5 px-2 text-center border-r border-slate-200 font-black text-slate-800 bg-slate-50/40 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        chasiNum <= 25 
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                          : chasiNum <= 55 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {chasiNum}차시
                      </span>
                    </td>

                    {/* Unit Input */}
                    <td className="py-1 px-2 border-r border-slate-200">
                      <input 
                        type="text"
                        value={planItem.unit || ''}
                        onChange={(e) => onPlanChange(chasiNum, 'unit', e.target.value)}
                        placeholder="대단원 / 중단원명"
                        className="w-full text-xs p-1.5 rounded-md border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-semibold text-slate-800 transition-all"
                      />
                    </td>

                    {/* Topic / Activity Input */}
                    <td className="py-1 px-2 border-r border-slate-200">
                      <input 
                        type="text"
                        value={planItem.topic || ''}
                        onChange={(e) => onPlanChange(chasiNum, 'topic', e.target.value)}
                        placeholder="주요 학습 내용 및 수업 활동 (예: 인공신경망의 원리 탐구)"
                        className="w-full text-xs p-1.5 rounded-md border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-slate-800 transition-all"
                      />
                    </td>

                    {/* Note Input */}
                    <td className="py-1 px-2">
                      <input 
                        type="text"
                        value={planItem.note || ''}
                        onChange={(e) => onPlanChange(chasiNum, 'note', e.target.value)}
                        placeholder="비고 / 교재 / 준비물"
                        className="w-full text-xs p-1.5 rounded-md border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-slate-600 transition-all"
                      />
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>💡 팁: 변경사항은 실시간으로 데이터베이스에 자동 저장되어 새로고침 후에도 유지됩니다.</span>
        </div>
        <div>
          <span>총 69차시 편성 기준 (주 4시수 편성)</span>
        </div>
      </div>
    </main>
  );
};
