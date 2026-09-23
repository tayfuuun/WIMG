import React from 'react';
import { PieChart, Shield, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react';
import { PortfolioAsset, TabKey } from '../types';
import { fmt } from '../utils/formatters';

interface PortfolioCockpitProps {
  portfolio?: PortfolioAsset[];
  onNavigate?: (tab: TabKey) => void;
  onRefreshPrices?: () => void;
  categoryLabel?: string;
}

export const PortfolioCockpit: React.FC<PortfolioCockpitProps> = ({
  portfolio = [],
  onNavigate,
  onRefreshPrices,
  categoryLabel,
}) => {
  const activeAssets = portfolio.filter((a) => a.active !== false && a.selected !== false);

  // Gesamtwert aller ausgewählten Vermögenswerte (inkl. Guthaben)
  const totalValue = activeAssets.reduce((sum, a) => sum + a.anteile * a.kursAktuell, 0);

  // Eingesetztes Kapital nur für Investment-Assets (Aktien, ETFs, Krypto) – ohne Guthaben!
  const investedAssets = activeAssets.filter((a) => a.kategorie !== 'guthaben');
  const totalInvested = investedAssets.reduce((sum, a) => sum + a.anteile * a.kaufpreisDurchschnitt, 0);
  const investedValue = investedAssets.reduce((sum, a) => sum + a.anteile * a.kursAktuell, 0);

  // Gesamt-Gewinn/Verlust berechnet sich ausschließlich aus den Investment-Assets
  const totalGain = investedValue - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const assetCount = activeAssets.length;

  // Allocation breakdown
  let kryptoPct = 0;
  let guthabenPct = 0;
  let aktienPct = 0;

  if (activeAssets.length > 0 && totalValue > 0) {
    const kryptoVal = activeAssets
      .filter((a) => a.kategorie === 'krypto')
      .reduce((sum, a) => sum + a.anteile * a.kursAktuell, 0);
    const guthabenVal = activeAssets
      .filter((a) => a.kategorie === 'guthaben')
      .reduce((sum, a) => sum + a.anteile * a.kursAktuell, 0);

    kryptoPct = Math.round((kryptoVal / totalValue) * 100);
    guthabenPct = Math.round((guthabenVal / totalValue) * 100);
    aktienPct = Math.max(0, 100 - kryptoPct - guthabenPct);
  }

  return (
    <div className="bg-gradient-to-br from-[#12231e] via-[#162e28] to-[#0f1f1a] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-emerald-950/60 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* 2. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <span>Portfolio</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Gesamtwert aller Vermögenswerte, Performance und Asset-Allokation in Echtzeit.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {onRefreshPrices && (
              <button
                type="button"
                onClick={onRefreshPrices}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                title="Kurse jetzt aktualisieren"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kurse aktualisieren</span>
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('portfolio')}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer border border-white/15 shrink-0"
              >
                <span>Zu Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Haupt-Metrik (obere Karte: Gesamtwert) */}
        <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {categoryLabel ? `GESAMTWERT (${categoryLabel.toUpperCase()})` : 'GESAMTWERT PORTFOLIO'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold">
                {assetCount} Assets
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block mt-1">
              {fmt(totalValue)}
            </span>
          </div>
        </div>

        {/* 4. Zwei geteilte Sub-Karten (mittlere Reihe, grid-cols-1 md:grid-cols-2 gap-4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Karte 1 (Eingesetztes Kapital) */}
          <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  EINGESETZTES KAPITAL
                </span>
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums block">
                {fmt(totalInvested)}
              </span>
              <span className="text-xs text-slate-300 font-medium block mt-1">
                Kaufwert der Investments (ohne Guthaben)
              </span>
            </div>
          </div>

          {/* Karte 2 (Gesamt-Gewinn / Verlust) */}
          <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  GESAMT-GEWINN / VERLUST
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  totalGain >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                }`}
              >
                <ArrowUpRight className={`w-3.5 h-3.5 ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>
                  {totalGainPct >= 0 ? '+' : ''}
                  {totalGainPct.toFixed(2)}%
                </span>
              </span>
            </div>
            <div>
              <span className={`text-xl sm:text-2xl font-black tabular-nums block ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalGain >= 0 ? `+${fmt(totalGain)}` : fmt(totalGain)}
              </span>
              <span className="text-xs text-slate-300 font-medium block mt-1">
                Reiner Wertzuwachs seit Kauf
              </span>
            </div>
          </div>
        </div>

        {/* 5. Allokations-Balken (Footer) */}
        <div className="pt-4 border-t border-[#23443b]/70 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Asset-Allokation</span>
            <span className="text-emerald-400">100% Aufteilung</span>
          </div>

          {/* Multi-Color Balken */}
          <div className="h-3 w-full bg-[#0e1b17] rounded-full overflow-hidden flex p-0.5 border border-[#224037]">
            {kryptoPct > 0 && (
              <div
                style={{ width: `${kryptoPct}%` }}
                className="h-full bg-emerald-400 transition-all duration-500"
                title={`Krypto (${kryptoPct}%)`}
              />
            )}
            {guthabenPct > 0 && (
              <div
                style={{ width: `${guthabenPct}%` }}
                className="h-full bg-sky-400 transition-all duration-500"
                title={`Guthaben (${guthabenPct}%)`}
              />
            )}
            {aktienPct > 0 && (
              <div
                style={{ width: `${aktienPct}%` }}
                className="h-full bg-teal-300 transition-all duration-500"
                title={`Aktien & ETFs (${aktienPct}%)`}
              />
            )}
          </div>

          {/* Legende mit farbigen Dots */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Krypto ({kryptoPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Guthaben ({guthabenPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-300" />
              <span>Aktien ({aktienPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
