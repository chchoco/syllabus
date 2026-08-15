import React from 'react';
import { ClassInfo, DateRowInfo, ProgressData, PlanData } from '../types';
import { Check, ArrowDownToLine, Sparkles } from 'lucide-react';

interface ClassTrackingViewProps {
  dateList: DateRowInfo[];
  classes: ClassInfo[];
  progressData: ProgressData;
  planData: PlanData;
  classChasiMap: Record<string, Record<string, Record<number, number>>>;
  onTopicChange: (classId: string, dateStr: string, periodIndex: number, value: string) => void;
  onToggleCheck: (classId: string, dateStr: string, periodIndex: number) => void;
  onFillFromPlan: (classId: string, dateStr: string, periodIndex: number, chasiNum: number) => void;
  onFillAllFromPlan: () => void;
}

export const ClassTrackingView: React.FC<ClassTrackingViewProps> = ({
  dateList,
  classes,
  progressData,
  planData,
  classChasiMap,
  onTopicChange,
  onToggleCheck,
  onFillFromPlan,
  onFillAllFromPlan,
}) => {
  return (
    <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden no-print transition-all">
      {/* Action Subbar */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            💡 분반별 수업일에 진도를 기재하고 완료 시 체크하세요. (주차 구분: 굵은 구분선)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onFillAllFromPlan}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="계획표의 차시별 학습 내용을 현재 모든 분반의 빈 진도란에 자동 입력합니다"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>계획표 내용 전체 자동 채우기</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto table-scroll max-h-[calc(100vh-210px)]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-extrabold sticky top-0 z-20 shadow-xs border-b border-slate-300">
            <tr>
              <th className="py-3 px-3 w-40 bg-slate-100 border-r border-slate-300 text-center">
                주차 / 날짜 (요일)
              </th>
              <th className="py-3 px-3 w-1/3 border-r border-slate-300 bg-indigo-50/80 text-indigo-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    P반
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-md">
                    월4 · 화7 · 수3 · 금6
                  </span>
                </div>
              </th>
              <th className="py-3 px-3 w-1/3 border-r border-slate-300 bg-emerald-50/80 text-emerald-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    R반
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md">
                    월6 · 수1 · 목7 · 금4
                  </span>
                </div>
              </th>
              <th className="py-3 px-3 w-1/3 bg-amber-50/80 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    S반
                  </span>
                  <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                    화2,3 · 목2,3 (연강)
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {dateList.map((row) => {
              const isExamOrHoliday = !!row.eventNote;
              const isMondayOrWeekStart = row.isNewWeek;

              return (
                <tr 
                  key={row.dateStr} 
                  className={`transition-colors ${
                    isMondayOrWeekStart ? 'week-divider' : ''
                  } ${
                    isExamOrHoliday 
                      ? 'bg-rose-50/40 hover:bg-rose-50/60' 
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Date & Week Column */}
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-800 bg-slate-50/70 whitespace-nowrap">
                    <div className="text-[11px] text-indigo-800 font-black">
                      [{row.weekNumber}주차]
                    </div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">
                      {row.dateStr} ({row.dayName})
                    </div>

                    {row.eventNote && (
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                          row.eventType === 'EXAM' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                          row.eventType === 'HOLIDAY' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-purple-100 text-purple-800 border border-purple-300'
                        }`}>
                          🚨 {row.eventNote}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Classes Columns (P, R, S) */}
                  {classes.map((cls) => {
                    const periods = cls.schedule[row.dayOfWeek];
                    const hasClass = !!periods && periods.length > 0;
                    const entry = progressData[cls.id]?.[row.dateStr] || {};

                    if (isExamOrHoliday) {
                      return (
                        <td key={cls.id} className="py-2 px-3 border-r border-slate-200 text-center text-slate-400 bg-rose-50/30 text-[11px] italic">
                          수업 없음 ({row.eventNote})
                        </td>
                      );
                    }

                    if (!hasClass) {
                      return (
                        <td key={cls.id} className="py-2 px-3 border-r border-slate-200 text-center text-slate-300 bg-slate-50/20">
                          -
                        </td>
                      );
                    }

                    return (
                      <td 
                        key={cls.id} 
                        className="py-1.5 px-2.5 border-r border-slate-200 bg-white"
                      >
                        <div className="space-y-1.5">
                          {periods.map((periodName, pIdx) => {
                            const topicVal = entry[`topic_${pIdx}`] !== undefined 
                              ? entry[`topic_${pIdx}`] 
                              : (pIdx === 0 ? (entry.topic || '') : '');
                            
                            const isChecked = entry[`checked_${pIdx}`] !== undefined 
                              ? entry[`checked_${pIdx}`] 
                              : (pIdx === 0 ? !!entry.checked : false);

                            const chasiNum = classChasiMap[cls.id]?.[row.dateStr]?.[pIdx];
                            const planItem = chasiNum ? planData[chasiNum] : undefined;

                            return (
                              <div 
                                key={pIdx} 
                                className={`p-2 rounded-xl border transition-all ${
                                  isChecked 
                                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs' 
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                      cls.id === 'P' ? 'bg-indigo-100 text-indigo-800' :
                                      cls.id === 'R' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {periodName}
                                    </span>
                                    {chasiNum && (
                                      <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                        {chasiNum}차시
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Import topic from plan button if chasi has topic and topicVal is empty */}
                                    {chasiNum && planItem?.topic && !topicVal && (
                                      <button
                                        type="button"
                                        onClick={() => onFillFromPlan(cls.id, row.dateStr, pIdx, chasiNum)}
                                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer bg-white px-1.5 py-0.5 rounded border border-indigo-200"
                                        title={`계획표 ${chasiNum}차시 내용 불러오기: "${planItem.topic}"`}
                                      >
                                        <ArrowDownToLine className="w-2.5 h-2.5" />
                                        계획불러오기
                                      </button>
                                    )}

                                    {/* Completed Checkbox */}
                                    <label className="flex items-center gap-1 cursor-pointer select-none">
                                      <input 
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => onToggleCheck(cls.id, row.dateStr, pIdx)}
                                        className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                                      />
                                      <span className={`text-[10px] font-bold ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`}>
                                        {isChecked ? '수업완료' : '미완료'}
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                <input
                                  type="text"
                                  value={topicVal || ''}
                                  onChange={(e) => onTopicChange(cls.id, row.dateStr, pIdx, e.target.value)}
                                  placeholder={planItem?.topic ? `계획: ${planItem.topic}` : "실제 진행한 진도 내용 입력"}
                                  className={`w-full text-xs px-2 py-1 rounded-lg border transition-all focus:outline-none ${
                                    isChecked 
                                      ? 'border-emerald-300 bg-white text-slate-800 font-medium' 
                                      : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 bg-white text-slate-800'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};
