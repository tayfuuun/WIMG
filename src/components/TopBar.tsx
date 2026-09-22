import React from 'react';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Landmark,
  CalendarClock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { TabKey } from '../types';
import { fmt } from '../utils/formatters';
import { TRANSLATIONS } from '../i18n/translations';

interface TopBarProps {
  activeTab: TabKey;
  // Finanzen KPIs
  totalIncome?: number;
  totalExpenses?: number;
  netSavings?: number;
  totalRestDebt?: number;
  // Kredite KPIs
  kreditMonthlyRate?: number;
  kreditRestDebt?: number;
  kreditActiveCount?: number;
  kreditTotalCount?: number;
  kreditPaidDebt?: number;
  kreditPaidPercent?: number;
  kreditDebtFreeDate?: string;
  kreditDebtFreeDuration?: string;

  isPortrait?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  totalIncome = 0,
  totalExpenses = 0,
  netSavings = 0,
  totalRestDebt = 0,
  kreditMonthlyRate = 0,
  kreditRestDebt = 0,
  kreditActiveCount = 0,
  kreditTotalCount = 0,
  kreditPaidDebt = 0,
  kreditPaidPercent = 0,
  kreditDebtFreeDate = '',
  kreditDebtFreeDuration = '',
  isPortrait,
}) => {
  const t = TRANSLATIONS.de;
  const info = t.tabHeadings[activeTab] || t.tabHeadings.fix;

  // Cockpit, Finanzen, Kredite, Energie, Lohn, Konten, Portfolio Tabs nutzen ihr eigenes Cockpit/Header
  if (['cockpit', 'finanzen', 'fix', 'kredite', 'energie', 'lohn', 'konten', 'portfolio'].includes(activeTab)) {
    return null;
  }

  const hasKpiPills = activeTab === 'finanzen' || activeTab === 'fix' || activeTab === 'kredite';

  return (
    <header
      id="main-topbar"
      className={`bg-white/95 backdrop-blur-md border-b border-[#e2e8e5] sticky top-0 z-20 ${
        isPortrait ? 'px-3 sm:px-4 py-2 sm:py-2.5' : 'px-6 py-3'
      } shadow-xs ${!hasKpiPills ? 'hidden sm:block' : ''}`}
    >
      {hasKpiPills ? (
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <div
            className={`grid gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0 ${
              activeTab === 'finanzen' || activeTab === 'fix'
                ? 'grid-cols-3'
                : 'grid-cols-2 md:grid-cols-4'
            }`}
          >
            {(activeTab === 'finanzen' || activeTab === 'fix') && (
              <>
                {/* Einnahmen */}
                <div
                  id="topbar-kpi-einnahmen"
                  className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#15803d]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                    <span className="truncate">{t.topBar.monthlyIncome}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#14532d] tabular-nums whitespace-nowrap mt-0.5 truncate">
                    {fmt(totalIncome)}
                  </div>
                </div>

                {/* Fixkosten */}
                <div
                  id="topbar-kpi-fixkosten"
                  className="bg-[#fef2f2] border border-[#fecaca] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#991b1b]">
                    <Wallet className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />
                    <span className="truncate">{t.topBar.fixedExpenses}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#991b1b] tabular-nums whitespace-nowrap mt-0.5 truncate">
                    {fmt(totalExpenses)}
                  </div>
                </div>

                {/* Sparrate */}
                <div
                  id="topbar-kpi-sparrate"
                  className="bg-[#f0fdf4] border border-[#86efac] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#166534]">
                    <PiggyBank className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                    <span className="truncate">{t.topBar.freeSavingsRate}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#166534] tabular-nums whitespace-nowrap mt-0.5 flex items-center gap-1 truncate">
                    <span>↗</span>
                    <span>{fmt(netSavings)}</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'kredite' && (
              <>
                {/* Aktueller monatlicher Abtrag */}
                <div
                  id="topbar-kpi-kredit-abtrag"
                  className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
                    <CalendarClock className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                    <span className="truncate">{t.topBar.monthlyPayment}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#1e40af] tabular-nums whitespace-nowrap mt-0.5 truncate">
                    {fmt(kreditMonthlyRate)}
                  </div>
                </div>

                {/* Restbetrag / Restschuld */}
                <div
                  id="topbar-kpi-kredit-restschuld"
                  className="bg-[#fef2f2] border border-[#fecaca] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#991b1b]">
                    <Landmark className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />
                    <span className="truncate">{t.topBar.remainingDebt}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#991b1b] tabular-nums whitespace-nowrap mt-0.5 truncate">
                    {fmt(kreditRestDebt)}
                  </div>
                </div>

                {/* Tilgungsstand */}
                <div
                  id="topbar-kpi-kredit-tilgung"
                  className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#15803d]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                    <span className="truncate">{t.topBar.paidOff}</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#15803d] tabular-nums whitespace-nowrap mt-0.5 truncate">
                    {kreditPaidPercent.toFixed(1)}% <span className="text-xs font-normal text-[#166534]">({fmt(kreditPaidDebt)})</span>
                  </div>
                </div>

                {/* Schuldenfrei am */}
                <div
                  id="topbar-kpi-kredit-schuldenfrei"
                  className="bg-[#fafaf9] border border-[#e7e5e4] rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 flex flex-col justify-center shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#44403c]">
                    <Calendar className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
                    <span className="truncate">Schuldenfrei am</span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-extrabold text-[#14231f] tabular-nums whitespace-nowrap mt-0.5 truncate flex items-center gap-1.5">
                    <span>{kreditDebtFreeDate || '—'}</span>
                    {kreditDebtFreeDuration && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e7e5e4] text-[#44403c]">
                        {kreditDebtFreeDuration}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Fallback for tabs like 'konten', 'energie', 'lohn', 'portfolio' */
        <div className="flex items-center justify-between min-w-0 w-full">
          <div className="min-w-0">
            <h1
              className={`${
                isPortrait ? 'text-lg sm:text-xl font-bold' : 'text-xl md:text-2xl font-bold'
              } tracking-tight text-[#111e19] truncate`}
            >
              {info.title}
            </h1>
            <p className="text-xs text-[#5f7069] mt-0.5 max-w-xl line-clamp-1">
              {info.subtitle}
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
