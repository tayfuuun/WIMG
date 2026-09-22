import React from 'react';
import { TrendingUp, Briefcase, ArrowUpRight, ArrowRight } from 'lucide-react';
import { LohnRecord, TabKey } from '../types';
import { fmt } from '../utils/formatters';

interface GehaltCockpitProps {
  lohn?: LohnRecord[];
  onNavigate?: (tab: TabKey) => void;
}

export const GehaltCockpit: React.FC<GehaltCockpitProps> = ({ lohn = [], onNavigate }) => {
  // Sort chronological
  const chronSorted = [...lohn].sort((a, b) => a.jahr - b.jahr);
  const latestRecord = chronSorted[chronSorted.length - 1];
  const firstRecord = chronSorted[0];
  const secondLatestRecord = chronSorted.length > 1 ? chronSorted[chronSorted.length - 2] : null;

  // Extracted or fallback values matching user specifications
  const aktuellNetto = latestRecord?.netto_monat ?? 3200;
  const aktuellBruttoJahr = latestRecord?.brutto_jahr ?? 65000;
  const standJahr = latestRecord?.jahr ?? 2025;

  const basisNetto = firstRecord?.netto_monat ?? 1500;
  const basisJahr = firstRecord?.jahr ?? 2011;

  const totalGrowthPercent =
    firstRecord && latestRecord && firstRecord.netto_monat > 0
      ? ((latestRecord.netto_monat - firstRecord.netto_monat) / firstRecord.netto_monat) * 100
      : 113.3;

  const prevYear = secondLatestRecord?.jahr ?? (standJahr - 1);
  const prevBrutto = secondLatestRecord?.brutto_jahr ?? (aktuellBruttoJahr / 1.067);

  const yearlySteigerungPercent =
    secondLatestRecord && prevBrutto > 0
      ? ((aktuellBruttoJahr - prevBrutto) / prevBrutto) * 100
      : 6.7;

  return (
    <div className="bg-gradient-to-br from-[#12231e] via-[#162e28] to-[#0f1f1a] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-950/60 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <span>Gehalt</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Entwicklung der monatlichen Netto- und Jahresbrutto-Vergütung inklusive Gesamtwachstum.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('lohn')}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all cursor-pointer"
              >
                <span>Zu Gehalt</span>
              </button>
            )}
          </div>
        </div>

        {/* AKTUELLES NETTO-EINKOMMEN */}
        <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              AKTUELLES NETTO-EINKOMMEN
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block">
                {fmt(aktuellNetto)}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-300">/ Monat</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              TOTAL WACHSTUM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-extrabold border border-emerald-500/35">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>+{totalGrowthPercent.toFixed(1)}%</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 block mt-1">
              von {fmt(basisNetto)} ({basisJahr}) bis heute
            </span>
          </div>
        </div>

        {/* JAHRESBRUTTO - Vollbreite Kachel */}
        <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                JAHRESBRUTTO
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block">
                {fmt(aktuellBruttoJahr)}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-300">/ Jahr</span>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-teal-400/10 text-teal-300 border border-teal-400/20 text-xs font-bold inline-block">
              Jahr {standJahr}
            </span>
            <span className="text-xs text-emerald-300 font-medium block mt-1.5">
              +{yearlySteigerungPercent.toFixed(1)}% Steigerung zum Vorjahr ({prevYear})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
