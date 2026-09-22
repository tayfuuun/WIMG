import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { fmt } from '../utils/formatters';

interface FinanzenCockpitProps {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  activeCount: number;
  totalCount: number;
}

export const FinanzenCockpit: React.FC<FinanzenCockpitProps> = ({
  totalIncome,
  totalExpenses,
  netSavings,
  activeCount,
  totalCount,
}) => {
  // Calculate progress ratios for the micro-progress bar
  const expenseRatio =
    totalIncome > 0 ? Math.min(100, Math.max(0, (totalExpenses / totalIncome) * 100)) : 100;
  const savingsRatio = totalIncome > 0 ? Math.max(0, 100 - expenseRatio) : 0;

  return (
    <div className="sticky top-0 z-30 -mt-1 sm:-mt-2 mb-4 sm:mb-6">
      <div className="bg-[#12231e] border border-emerald-950/60 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md bg-[#12231e]/95 overflow-hidden">
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
          {/* Row 1: Header/Title */}
          <div className="flex items-center justify-between gap-2 shrink-0 border-b border-emerald-900/40 pb-2.5">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                Finanzen
              </span>
            </div>
          </div>

          {/* Row 2: 3 Core KPI Metrics (Mobile: Einnahmen & Fixkosten row 1, Sparrate row 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 items-center">
            {/* 1. Einnahmen */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-400 uppercase truncate">
                EINNAHMEN
              </span>
              <span className="text-white font-extrabold text-base sm:text-xl md:text-2xl tabular-nums truncate leading-tight mt-1">
                {fmt(totalIncome)}
              </span>
            </div>

            {/* 2. Fixkosten */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-rose-300 uppercase truncate">
                FIXKOSTEN
              </span>
              <span className="text-rose-400 font-extrabold text-base sm:text-xl md:text-2xl tabular-nums truncate leading-tight mt-1">
                {fmt(totalExpenses)}
              </span>
            </div>

            {/* 3. Sparrate (Col-span-2 on mobile, single col on sm+) */}
            <div className="col-span-2 sm:col-span-1 flex flex-col min-w-0 text-left pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-900/40">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-emerald-300 uppercase truncate">
                SPARRATE
              </span>
              <div className="text-emerald-400 font-extrabold text-base sm:text-xl md:text-2xl tabular-nums flex items-center justify-start gap-1 truncate leading-tight mt-1">
                {netSavings >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span className="truncate">+{fmt(netSavings)}</span>
                  </>
                ) : (
                  <span className="text-rose-400 truncate">{fmt(netSavings)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Micro-Progress Bar (3px at bottom edge) */}
        <div className="h-[3px] w-full bg-emerald-950/80 overflow-hidden flex">
          <div
            className="bg-rose-500/90 h-full transition-all duration-300 ease-out"
            style={{ width: `${expenseRatio}%` }}
            title={`Fixkosten: ${expenseRatio.toFixed(1)}%`}
          />
          <div
            className="bg-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${savingsRatio}%` }}
            title={`Sparrate: ${savingsRatio.toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
};
