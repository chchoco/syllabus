import React from 'react';
import { DateRowInfo, ClassInfo, ProgressData, PlanData } from '../types';

interface WeeklyPlanItem {
  weekNumber: number;
  startDate: string;
  endDate: string;
  hasExam: boolean;
  examName: string | null;
  chasiList: number[];
}

interface PrintViewProps {
  activeTab: 'plan' | 'tracking';
  schoolYear: string;
  subjectName: string;
  teacherName: string;
  weeklyPlans: WeeklyPlanItem[];
  planData: PlanData;
  dateList: DateRowInfo[];
  classes: ClassInfo[];
  progressData: ProgressData;
  classChasiMap: Record<string, Record<string, Record<number, number>>>;
}

export const PrintView: React.FC<PrintViewProps> = ({
  activeTab,
  schoolYear,
  subjectName,
  teacherName,
  weeklyPlans,
  planData,
  dateList,
  classes,
  progressData,
  classChasiMap,
}) => {
  return (
    <div className="print-only p-4 bg-white text-black font-sans">
      {/* Header Info & Signature Area */}
      <div className="flex items-end justify-between border-b-2 border-black pb-3 mb-3">
        <div>
          <h1 className="text-xl font-bold font-serif tracking-tight">
            {schoolYear} 교수·학습 수업 진도표 ({activeTab === 'plan' ? '주차별 공통 진도 계획' : '분반별 수업 실적'})
          </h1>
          <div className="text-xs font-semibold mt-1 flex items-center gap-4 text-slate-800">
            <span>교과목: <strong className="underline font-bold text-black">{subjectName}</strong></span>
            <span>담당교사: <strong className="font-bold text-black">{teacherName}</strong></span>
            <span>출력일시: {new Date().toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        {/* Optional Simple Signature Stamp Box */}
        <div className="border border-black text-[10px] text-center">
          <table className="border-collapse text-[10px]">
            <tbody>
              <tr>
                <td rowSpan={2} className="border-r border-black px-1.5 py-1 bg-slate-100 font-bold">결재</td>
                <td className="border-b border-r border-black px-3 py-0.5 font-semibold">담당교사</td>
                <td className="border-b border-black px-3 py-0.5 font-semibold">부장</td>
              </tr>
              <tr>
                <td className="border-r border-black h-8"></td>
                <td className="h-8"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Table for Print */}
      {activeTab === 'plan' ? (
        <table className="w-full border-collapse border border-black text-[11px] print-table">
          <thead>
            <tr className="bg-slate-200 text-center font-bold text-black">
              <th className="border border-black py-1.5 w-20">주차 / 기간</th>
              <th className="border border-black py-1.5 w-14">차시</th>
              <th className="border border-black py-1.5 w-44">대단원 / 중단원</th>
              <th className="border border-black py-1.5">주요 학습 내용 및 수업 활동</th>
              <th className="border border-black py-1.5 w-28">비고 / 교재</th>
            </tr>
          </thead>
          <tbody>
            {weeklyPlans.map((w) => {
              if (w.hasExam) {
                return (
                  <tr key={`print-week-${w.weekNumber}`} className="bg-slate-100 font-bold">
                    <td className="border border-black text-center py-1">
                      {w.weekNumber}주차<br />
                      <span className="text-[9px] font-normal">{w.startDate.slice(5)}~{w.endDate.slice(5)}</span>
                    </td>
                    <td colSpan={4} className="border border-black text-center py-1.5 bg-slate-100 font-bold">
                      🚨 [{w.examName}] 주간 (수업 제외)
                    </td>
                  </tr>
                );
              }

              return w.chasiList.map((chasiNum, idx) => {
                const item = planData[chasiNum] || {};
                const isMidtermEnd = chasiNum === 25;
                const isFinalEnd = chasiNum === 55;

                return (
                  <tr 
                    key={`print-chasi-${chasiNum}`} 
                    className={`${idx === 0 ? "week-divider" : ""} ${
                      isMidtermEnd ? "border-b-2 border-black font-semibold" : ""
                    } ${isFinalEnd ? "border-b-2 border-black font-semibold" : ""}`}
                  >
                    {idx === 0 && (
                      <td rowSpan={w.chasiList.length} className="border border-black text-center font-bold align-middle bg-slate-50">
                        <div>{w.weekNumber}주차</div>
                        <div className="text-[9px] font-normal text-slate-600">{w.startDate.slice(5)}~{w.endDate.slice(5)}</div>
                      </td>
                    )}
                    <td className="border border-black text-center font-bold py-1">
                      {chasiNum}차시
                    </td>
                    <td className="border border-black px-2 py-1">{item.unit || ''}</td>
                    <td className="border border-black px-2 py-1">{item.topic || ''}</td>
                    <td className="border border-black px-2 py-1 text-center">{item.note || ''}</td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      ) : (
        /* Tracking Table for Print */
        <table className="w-full border-collapse border border-black text-[10px] print-table">
          <thead>
            <tr className="bg-slate-200 text-center font-bold text-black">
              <th className="border border-black py-1.5 w-28">날짜 (요일)</th>
              <th className="border border-black py-1.5 w-1/3">P반 (월4/화7/수3/금6)</th>
              <th className="border border-black py-1.5 w-1/3">R반 (월6/수1/목7/금4)</th>
              <th className="border border-black py-1.5 w-1/3">S반 (화2,3/목2,3 연강)</th>
            </tr>
          </thead>
          <tbody>
            {dateList.map((row) => (
              <tr key={`print-track-${row.dateStr}`} className={row.isNewWeek ? "week-divider" : ""}>
                <td className="border border-black text-center font-semibold bg-slate-50 py-1">
                  <span className="font-bold">[{row.weekNumber}주차]</span> {row.dateStr.slice(5)} ({row.dayName})
                  {row.eventNote && <div className="text-[9px] font-bold text-red-600">[{row.eventNote}]</div>}
                </td>
                {classes.map((cls) => {
                  const periods = cls.schedule[row.dayOfWeek] || [];
                  const entry = progressData[cls.id]?.[row.dateStr] || {};

                  if (row.eventNote) {
                    return (
                      <td key={cls.id} className="border border-black text-center text-slate-400 bg-slate-100 py-1 italic">
                        수업없음
                      </td>
                    );
                  }
                  if (!periods.length) {
                    return (
                      <td key={cls.id} className="border border-black text-center text-slate-300 py-1">
                        -
                      </td>
                    );
                  }

                  return (
                    <td key={cls.id} className="border border-black px-2 py-1 align-top">
                      {periods.map((pName, pIdx) => {
                        const topicVal = entry[`topic_${pIdx}`] !== undefined 
                          ? entry[`topic_${pIdx}`] 
                          : (pIdx === 0 ? entry.topic : '');
                        const isChecked = entry[`checked_${pIdx}`] !== undefined 
                          ? entry[`checked_${pIdx}`] 
                          : (pIdx === 0 ? entry.checked : false);
                        const chasiNum = classChasiMap[cls.id]?.[row.dateStr]?.[pIdx];

                        return (
                          <div key={pIdx} className={pIdx > 0 ? "mt-1 pt-1 border-t border-slate-300" : ""}>
                            <span className="font-bold text-[9px] text-slate-700">
                              [{pName}]{chasiNum ? ` (${chasiNum}차시)` : ''} {isChecked ? ' [✓]' : ' [ ]'}
                            </span>
                            <span className="ml-1 text-[10px]">{topicVal || ''}</span>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
