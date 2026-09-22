import React from 'react';
import { Landmark, CalendarClock, TrendingUp, Calendar, ShieldCheck } from 'lucide-react';
import { fmt } from '../utils/formatters';

interface KrediteCockpitProps {
  monthlyRate: number;
  restDebt: number;
  paidPercent: number;
  paidDebt?: number;
  debtFreeDate?: string;
  activeCount: number;
  totalCount: number;
}

export const KrediteCockpit: React.FC<KrediteCockpitProps> = ({
  monthlyRate,
  restDebt,
  paidPercent,
  paidDebt = 0,
  debtFreeDate = '',
  activeCount,
  totalCount,
}) => {
  const pctPaidClamped = Math.min(100, Math.max(0, paidPercent));

  return (
    <div className="sticky top-0 z-30 -mt-1 sm:-mt-2 mb-5 sm:mb-6">
      <div className="bg-[#12231e] border border-emerald-950/60 rounded-2xl shadow-xl backdrop-blur-md bg-[#12231e]/95 text-white overflow-hidden transition-all duration-200">
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
          {/* Row 1: Left: Icon & Title */}
          <div className="flex items-center justify-between gap-2.5 shrink-0 border-b border-emerald-900/40 pb-2.5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                Kredite
              </h2>
            </div>
          </div>

          {/* Row 2: The 4 Core Metrics (New line, NO BADGE/BOX, clean design, larger font size) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-center">
            {/* 1. Monatlicher Abtrag */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-blue-300 flex items-center gap-1 truncate">
                <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                ABTRAG / MO
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-blue-400 tabular-nums truncate leading-tight mt-1">
                {fmt(monthlyRate)}
              </span>
            </div>

            {/* 2. Restschuld */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-rose-300 flex items-center gap-1 truncate">
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                RESTSCHULD
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-rose-400 tabular-nums truncate leading-tight mt-1">
                {fmt(restDebt)}
              </span>
            </div>

            {/* 3. Tilgungsquote */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-300 flex items-center gap-1 truncate">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                GETILGT
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-400 tabular-nums truncate leading-tight mt-1">
                {pctPaidClamped.toFixed(1)}%
              </span>
            </div>

            {/* 4. Schuldenfrei-Ziel */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1 truncate">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                SCHULDENFREI
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-extrabold text-white tabular-nums truncate leading-tight mt-1">
                {debtFreeDate || '—'}
              </span>
            </div>
          </div>
        </div>

      {/* Micro Progress Bar at Bottom Edge */}
      <div className="w-full h-[3px] bg-[#0c1814] flex overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
          style={{ width: `${pctPaidClamped}%` }}
          title={`Tilgung: ${pctPaidClamped.toFixed(1)}%`}
        />
        <div
          className="h-full bg-slate-800/80 transition-all duration-300"
          style={{ width: `${100 - pctPaidClamped}%` }}
        />
      </div>
    </div>
  </div>
);
};
