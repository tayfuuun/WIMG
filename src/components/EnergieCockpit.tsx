import React from 'react';
import { Zap, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { EnergieData, TabKey } from '../types';
import { fmt } from '../utils/formatters';

interface EnergieCockpitProps {
  energie?: EnergieData;
  onNavigate?: (tab: TabKey) => void;
  activeSubTab?: 'both' | 'strom' | 'gas';
  onSelectSubTab?: (subTab: 'both' | 'strom' | 'gas') => void;
}

export const EnergieCockpit: React.FC<EnergieCockpitProps> = ({
  energie,
  onNavigate,
  activeSubTab = 'both',
  onSelectSubTab,
}) => {
  // Extract values or use default fallback numbers matching user specification
  const stromAbschlag = energie?.strom?.abschlag ?? 60.0;
  const gasAbschlag = energie?.gas?.abschlag ?? 120.0;
  const gesamtAbschlag = stromAbschlag + gasAbschlag;

  // Strom metrics
  const strom2026 = energie?.strom?.verbrauch?.find((v) => v.jahr === 2026)?.kwh ?? 800;
  const stromLimit = energie?.strom?.angegebenerVerbrauch ?? 2000;
  const stromPrognose = 1102; // Hochrechnung kWh

  // Gas metrics
  const gas2026Record = energie?.gas?.verbrauch?.find((v) => v.jahr === 2026);
  const gas2026 = gas2026Record
    ? gas2026Record.wasser + gas2026Record.heizung
    : 7800;
  const gasLimit = 14000; // kWh limit
  const gasPrognose = 10744; // Hochrechnung kWh

  // Year progress (Day 265 / 365 = ~73%)
  const yearProgressPercent = 73;
  const stromSollPercent = 55; // 55% im Soll
  const gasSollPercent = 70; // 70% im Soll

  return (
    <div className="bg-gradient-to-br from-[#12231e] via-[#162e28] to-[#0f1f1a] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-950/60 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* 2. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <span>Energie</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Zentraler Überblick über Strom- und Gasverbräuche, monatliche Abschläge und Jahresprognosen.
            </p>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('energie')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/15 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Zu Energie</span>
            </button>
          )}
        </div>

        {/* 3. Haupt-Metriken (obere Reihe) */}
        <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              GESAMTE ABSCHLÄGE
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block mt-1">
              {fmt(gesamtAbschlag)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-300 block mt-1">
              / Monat (Strom: {fmt(stromAbschlag)} | Gas: {fmt(gasAbschlag)})
            </span>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              STATUS PROGNOSE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>-48.2% vs. Vorjahr</span>
            </span>
          </div>
        </div>

        {/* 4. Zwei geteilte Sub-Karten (mittlere Reihe, grid-cols-1 md:grid-cols-2 gap-4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Karte 1 (Strom / Elektrik) */}
          <div
            onClick={() => onSelectSubTab?.(activeSubTab === 'strom' ? 'both' : 'strom')}
            className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-3 transition-all cursor-pointer select-none active:scale-[0.99] ${
              activeSubTab === 'strom'
                ? 'bg-[#1e4438] border-2 border-amber-400 ring-2 ring-amber-400/40'
                : activeSubTab === 'gas'
                ? 'bg-[#18362d]/60 border border-[#2b5548] opacity-60 hover:opacity-100 hover:border-amber-400/60'
                : 'bg-[#18362d]/90 border border-[#2b5548] hover:border-amber-400/60'
            }`}
            title="Klicken zum Filtern nach Strom (Elektrik)"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    STROM (ELEKTRIK)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-bold">
                  {strom2026.toLocaleString('de-DE')} / {stromLimit.toLocaleString('de-DE')} kWh
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                  {strom2026.toLocaleString('de-DE')} kWh
                </span>
                <span className="text-xs text-slate-300 font-medium block mt-1">
                  Abschlag: {fmt(stromAbschlag)}/Mo | Prognose: {stromPrognose.toLocaleString('de-DE')} kWh
                </span>
              </div>
            </div>

            {/* Mini Progress */}
            <div className="w-full bg-[#0e1b17] h-2 rounded-full overflow-hidden p-0.5 border border-[#224037]">
              <div
                style={{ width: `${Math.min(100, (strom2026 / stromLimit) * 100)}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Karte 2 (Gas & Heizung) */}
          <div
            onClick={() => onSelectSubTab?.(activeSubTab === 'gas' ? 'both' : 'gas')}
            className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-3 transition-all cursor-pointer select-none active:scale-[0.99] ${
              activeSubTab === 'gas'
                ? 'bg-[#1e4438] border-2 border-rose-400 ring-2 ring-rose-400/40'
                : activeSubTab === 'strom'
                ? 'bg-[#18362d]/60 border border-[#2b5548] opacity-60 hover:opacity-100 hover:border-rose-400/60'
                : 'bg-[#18362d]/90 border border-[#2b5548] hover:border-rose-400/60'
            }`}
            title="Klicken zum Filtern nach Gas & Heizung"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    GAS &amp; HEIZUNG
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-400/10 text-rose-300 border border-rose-400/20 text-xs font-bold">
                  {gas2026.toLocaleString('de-DE')} / {gasLimit.toLocaleString('de-DE')} kWh
                </span>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                  {gas2026.toLocaleString('de-DE')} kWh
                </span>
                <span className="text-xs text-slate-300 font-medium block mt-1">
                  Abschlag: {fmt(gasAbschlag)}/Mo | Prognose: {gasPrognose.toLocaleString('de-DE')} kWh
                </span>
              </div>
            </div>

            {/* Mini Progress */}
            <div className="w-full bg-[#0e1b17] h-2 rounded-full overflow-hidden p-0.5 border border-[#224037]">
              <div
                style={{ width: `${Math.min(100, (gas2026 / gasLimit) * 100)}%` }}
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Fortschrittsbalken / Status (Footer) */}
        <div className="pt-4 border-t border-[#23443b]/70 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Verbrauchs-Status 2026</span>
            <span className="text-emerald-400">{yearProgressPercent}% des Jahres vergangen</span>
          </div>

          {/* Horizontaler Balken */}
          <div className="h-3 w-full bg-[#0e1b17] rounded-full overflow-hidden flex p-0.5 border border-[#224037]">
            <div
              style={{ width: `${stromSollPercent}%` }}
              className="h-full bg-amber-400 transition-all duration-500"
              title={`Strom: ${stromSollPercent}% im Soll`}
            />
            <div
              style={{ width: `${gasSollPercent - stromSollPercent}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
              title={`Gas: ${gasSollPercent}% im Soll`}
            />
            <div
              style={{ width: `${100 - gasSollPercent}%` }}
              className="h-full bg-slate-700/60 transition-all duration-500"
              title="Verbleibend 2026"
            />
          </div>

          {/* Legende mit farbigen Dots */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Strom: {stromSollPercent}% im Soll</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Gas: {gasSollPercent}% im Soll</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Verbleibend 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
