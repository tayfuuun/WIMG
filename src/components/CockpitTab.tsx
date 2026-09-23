import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Home,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  RotateCcw,
  PieChart,
  Check,
} from 'lucide-react';
import { EnergieCockpit } from './EnergieCockpit';
import { GehaltCockpit } from './GehaltCockpit';
import { PortfolioCockpit } from './PortfolioCockpit';
import {
  FixCategory,
  IncomeGroup,
  Kredit,
  EnergieData,
  LohnRecord,
  KontoRecord,
  PortfolioAsset,
  TabKey,
} from '../types';
import { fmt, monthly, parseNum } from '../utils/formatters';
import { TRANSLATIONS } from '../i18n/translations';

export type CockpitKey = 'budget' | 'kredite' | 'energie' | 'gehalt' | 'portfolio';

export interface CockpitItemConfig {
  id: CockpitKey;
  visible: boolean;
}

const STORAGE_KEY = 'financial_cockpit_config_v1';

const DEFAULT_COCKPIT_CONFIG: CockpitItemConfig[] = [
  { id: 'budget', visible: true },
  { id: 'kredite', visible: true },
  { id: 'energie', visible: true },
  { id: 'gehalt', visible: true },
  { id: 'portfolio', visible: true },
];

const COCKPIT_META: Record<CockpitKey, { title: string; subtitle: string; icon: React.FC<{ className?: string }> }> = {
  budget: {
    title: 'Finanzen',
    subtitle: 'Liquidität, Einnahmen, Fixkosten & Sparrate',
    icon: Wallet,
  },
  kredite: {
    title: 'Kredite',
    subtitle: 'Tilgungsstand, Restschuld & Monatsraten',
    icon: Landmark,
  },
  energie: {
    title: 'Energie',
    subtitle: 'Strom- & Gasverbräuche und Prognosen',
    icon: Zap,
  },
  gehalt: {
    title: 'Gehalt',
    subtitle: 'Netto- & Brutto-Entwicklung und Karriere',
    icon: TrendingUp,
  },
  portfolio: {
    title: 'Portfolio',
    subtitle: 'Vermögen, Performance & Asset-Allokation',
    icon: PieChart,
  },
};

import { calculateCurrentRestDebt } from '../utils/creditCalculator';

interface CockpitTabProps {
  categories: FixCategory[];
  incomeGroups: IncomeGroup[];
  kredite?: Kredit[];
  energie?: EnergieData;
  lohn?: LohnRecord[];
  konten?: KontoRecord[];
  portfolio?: PortfolioAsset[];
  onNavigate: (tab: TabKey) => void;
}

export const CockpitTab: React.FC<CockpitTabProps> = ({
  categories,
  incomeGroups,
  kredite = [],
  energie,
  lohn = [],
  konten = [],
  portfolio = [],
  onNavigate,
}) => {
  const t = TRANSLATIONS.de;

  // Persistent Cockpit Config State
  const [cockpitConfig, setCockpitConfig] = useState<CockpitItemConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = DEFAULT_COCKPIT_CONFIG.filter((d) => !existingIds.has(d.id));
          return [...parsed, ...missing];
        }
      }
    } catch (e) {
      console.error('Failed to parse cockpit config from localStorage', e);
    }
    return DEFAULT_COCKPIT_CONFIG;
  });

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<CockpitItemConfig[]>(cockpitConfig);

  const handleOpenSettings = () => {
    setDraftConfig([...cockpitConfig]);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    setCockpitConfig(draftConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftConfig));
    } catch (e) {
      console.error('Failed to save cockpit config to localStorage', e);
    }
    setIsSettingsOpen(false);
  };

  const handleResetSettings = () => {
    setDraftConfig(DEFAULT_COCKPIT_CONFIG);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newConfig = [...draftConfig];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newConfig.length) return;
    const temp = newConfig[index];
    newConfig[index] = newConfig[targetIndex];
    newConfig[targetIndex] = temp;
    setDraftConfig(newConfig);
  };

  const handleToggleVisible = (id: CockpitKey) => {
    setDraftConfig(
      draftConfig.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  // 1. Finanzen Computations
  const activeCategories = categories.filter((c) => c.active !== false);
  const totalFixExpenses = activeCategories.reduce(
    (sum, cat) =>
      sum +
      cat.items
        .filter((it) => it.active !== false)
        .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
    0
  );

  const activeIncomeGroups = incomeGroups.filter((g) => g.active !== false);
  const totalIncome = activeIncomeGroups.reduce(
    (sum, grp) =>
      sum +
      grp.items
        .filter((it) => it.active !== false)
        .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
    0
  );

  const netSavingsRate = totalIncome - totalFixExpenses;
  const savingsRatePercent = totalIncome > 0 ? (netSavingsRate / totalIncome) * 100 : 0;
  const fixedCostSharePercent = totalIncome > 0 ? (totalFixExpenses / totalIncome) * 100 : 0;

  // 2. Kredite Computations
  const activeKredite = kredite.filter((k) => k.active !== false);
  const activeDebtKredite = activeKredite.filter((k) => !k.isBausparer);

  const totalRestDebt = activeDebtKredite.reduce((sum, k) => sum + calculateCurrentRestDebt(k), 0);
  const totalOriginalDebt = activeDebtKredite.reduce((sum, k) => sum + parseNum(k.gesamtbetrag), 0);
  const totalLoanMonthlyRate = activeKredite.reduce((sum, k) => sum + parseNum(k.rate_monat || 0), 0);

  const ratenKredite = activeKredite.filter((k) => {
    const cat = k.kategorie || 'ratenkredit';
    return cat === 'ratenkredit' || cat === 'konsum';
  });
  const ratenDebt = ratenKredite.filter((k) => !k.isBausparer);
  const ratenRest = ratenDebt.reduce((s, k) => s + calculateCurrentRestDebt(k), 0);
  const ratenOriginal = ratenDebt.reduce((s, k) => s + parseNum(k.gesamtbetrag), 0);
  const ratenPaid = Math.max(0, ratenOriginal - ratenRest);
  const ratenPaidPct = ratenOriginal > 0 ? (ratenPaid / ratenOriginal) * 100 : 0;
  const ratenRate = ratenKredite.reduce((s, k) => s + parseNum(k.rate_monat || 0), 0);

  const immoKredite = activeKredite.filter((k) => k.kategorie === 'immobilie');
  const immoDebt = immoKredite.filter((k) => !k.isBausparer);
  const immoRest = immoDebt.reduce((s, k) => s + calculateCurrentRestDebt(k), 0);
  const immoOriginal = immoDebt.reduce((s, k) => s + parseNum(k.gesamtbetrag), 0);
  const immoPaid = Math.max(0, immoOriginal - immoRest);
  const immoPaidPct = immoOriginal > 0 ? (immoPaid / immoOriginal) * 100 : 0;
  const immoRate = immoKredite.reduce((s, k) => s + parseNum(k.rate_monat || 0), 0);

  // Kredite Filter State
  const [kreditFilter, setKreditFilter] = useState<'alle' | 'ratenkredit' | 'immobilie'>('alle');

  const displayedRestDebt =
    kreditFilter === 'alle'
      ? totalRestDebt
      : kreditFilter === 'ratenkredit'
      ? ratenRest
      : immoRest;

  const displayedOriginalDebt =
    kreditFilter === 'alle'
      ? totalOriginalDebt
      : kreditFilter === 'ratenkredit'
      ? ratenOriginal
      : immoOriginal;

  const displayedMonthlyRate =
    kreditFilter === 'alle'
      ? totalLoanMonthlyRate
      : kreditFilter === 'ratenkredit'
      ? ratenRate
      : immoRate;

  const displayedRestPct =
    displayedOriginalDebt > 0 ? (displayedRestDebt / displayedOriginalDebt) * 100 : 0;

  // Cockpit Module Renderer
  const renderCockpitModule = (id: CockpitKey) => {
    switch (id) {
      case 'budget':
        return (
          <div
            key="budget"
            className="bg-gradient-to-br from-[#14231f] via-[#1a332c] to-[#12221e] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-[#234238] relative overflow-hidden"
          >
            {/* Background glow effects */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#86efac]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#0f766e]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Zeile 1 (Header) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#86efac] shrink-0" />
                    <span>Finanzen</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a4beb3]">
                    Zentraler Überblick über Liquidität, monatliche Einnahmen, Fixkosten und freies Sparpotenzial.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('finanzen')}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer border border-white/15 shrink-0 self-start sm:self-auto"
                >
                  <span>Zu Finanzen</span>
                </button>
              </div>

              {/* Zeile 2: Verfügbares Einkommen */}
              <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a4beb3] block">
                    Verfügbares Einkommen
                  </span>
                  <span
                    className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight block mt-1 ${
                      netSavingsRate >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                    }`}
                  >
                    {netSavingsRate >= 0 ? `+${fmt(netSavingsRate)}` : fmt(netSavingsRate)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a4beb3] block mb-1">
                    Sparquote
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#16a34a]/20 text-[#86efac] text-xs font-black tabular-nums border border-[#16a34a]/40">
                    {savingsRatePercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Zeile 3: Einnahmen & Fixkosten */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 border border-[#2b5548] shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#86efac] block">
                      Monatliche Einnahmen
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight block mt-1">
                      {fmt(totalIncome)}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 text-[#86efac] border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 border border-[#2b5548] shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#f87171] block">
                      Monatliche Fixkosten
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight block mt-1">
                      {fmt(totalFixExpenses)}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Cashflow Distribution Bar */}
            <div className="mt-6 pt-5 border-t border-[#23443b]/70">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#a4beb3] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f87171]" />
                  <span>Fixkosten ({fixedCostSharePercent.toFixed(1)}%)</span>
                </span>
                <span className="text-[#86efac] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#86efac]" />
                  <span>Freie Sparrate ({Math.max(0, savingsRatePercent).toFixed(1)}%)</span>
                </span>
              </div>

              <div className="h-3 w-full bg-[#0e1b17] rounded-full overflow-hidden flex p-0.5 border border-[#224037]">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, fixedCostSharePercent))}%` }}
                  className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] rounded-l-full transition-all duration-500"
                  title={`Fixkosten: ${fmt(totalFixExpenses)}`}
                />
                <div
                  style={{ width: `${Math.min(100, Math.max(0, savingsRatePercent))}%` }}
                  className="h-full bg-gradient-to-r from-[#22c55e] to-[#86efac] rounded-r-full transition-all duration-500"
                  title={`Freie Sparrate: ${fmt(netSavingsRate)}`}
                />
              </div>
            </div>
          </div>
        );

      case 'kredite':
        return (
          <div
            key="kredite"
            className="bg-gradient-to-br from-[#14231f] via-[#1a332c] to-[#12221e] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-[#234238] relative overflow-hidden"
          >
            {/* Background glow effects */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#0f766e]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Zeile 1 (Header) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                    <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-[#38bdf8] shrink-0" />
                    <span>Kredite</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a4beb3]">
                    Zentraler Überblick über alle Verbindlichkeiten, getrennte Tilgungsquoten und monatliche Abträge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('kredite')}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer border border-white/15 shrink-0 self-start sm:self-auto"
                >
                  <span>Zu Kredite</span>
                </button>
              </div>

              {/* Kachel-Zeile 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#f87171] block">
                      Gesamtschuld
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#fca5a5] tabular-nums tracking-tight block mt-1">
                      {fmt(displayedRestDebt)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#cbd5e1] block mt-1.5">
                      von {fmt(displayedOriginalDebt)} ursprünglich
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a4beb3] block mb-1">
                      Restquote
                    </span>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#ef4444]/20 text-[#fca5a5] text-xs font-black tabular-nums border border-[#ef4444]/40">
                      {displayedRestPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#18362d]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#2b5548] shadow-lg flex items-center justify-between">
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        kreditFilter === 'alle'
                          ? 'text-[#f87171]'
                          : kreditFilter === 'immobilie'
                          ? 'text-[#4ade80]'
                          : 'text-[#60a5fa]'
                      }`}
                    >
                      Monatlicher Abtrag
                    </span>
                    <span
                      className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight block mt-1 ${
                        kreditFilter === 'alle'
                          ? 'text-[#fca5a5]'
                          : kreditFilter === 'immobilie'
                          ? 'text-[#86efac]'
                          : 'text-[#93c5fd]'
                      }`}
                    >
                      {fmt(displayedMonthlyRate)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#cbd5e1] block mt-1.5">
                      {kreditFilter === 'alle'
                        ? `Gesamte monatliche Kreditrate aller ${activeKredite.length} Kredite`
                        : kreditFilter === 'ratenkredit'
                        ? `Ratenkredite (${ratenKredite.length})`
                        : `Immobilienkredite (${immoKredite.length})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kachel-Zeile 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setKreditFilter(kreditFilter === 'ratenkredit' ? 'alle' : 'ratenkredit')}
                  title={kreditFilter === 'ratenkredit' ? 'Filter aufheben' : 'Nach Ratenkrediten filtern'}
                  className={`text-left backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-lg flex items-center justify-between transition-all cursor-pointer group ${
                    kreditFilter === 'ratenkredit'
                      ? 'bg-[#132c3f]/95 border-[#3b82f6] ring-2 ring-[#3b82f6]/60 shadow-blue-900/30 scale-[1.01]'
                      : 'bg-[#18362d]/90 hover:bg-[#1c3f35] border-[#2b5548] hover:border-[#3b6b5a]'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#60a5fa]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#60a5fa]">
                          Ratenkredite
                        </span>
                      </div>
                      {kreditFilter === 'ratenkredit' && (
                        <span className="px-2 py-0.5 rounded-md bg-[#2563eb] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight block mt-1">
                      {fmt(ratenRest)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#cbd5e1] block mt-1.5">
                      Rate: {fmt(ratenRate)} / Mo.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setKreditFilter(kreditFilter === 'immobilie' ? 'alle' : 'immobilie')}
                  title={kreditFilter === 'immobilie' ? 'Filter aufheben' : 'Nach Immobilienkrediten filtern'}
                  className={`text-left backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-lg flex items-center justify-between transition-all cursor-pointer group ${
                    kreditFilter === 'immobilie'
                      ? 'bg-[#123628]/95 border-[#22c55e] ring-2 ring-[#22c55e]/60 shadow-emerald-900/30 scale-[1.01]'
                      : 'bg-[#18362d]/90 hover:bg-[#1c3f35] border-[#2b5548] hover:border-[#3b6b5a]'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#4ade80]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4ade80]">
                          Immobilienkredite
                        </span>
                      </div>
                      {kreditFilter === 'immobilie' && (
                        <span className="px-2 py-0.5 rounded-md bg-[#16a34a] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                          Aktiv
                        </span>
                      )}
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight block mt-1">
                      {fmt(immoRest)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#cbd5e1] block mt-1.5">
                      Rate: {fmt(immoRate)} / Mo.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Debt Progress Bars */}
            <div className="mt-6 pt-5 border-t border-[#23443b]/70 space-y-4">
              {(kreditFilter === 'alle' || kreditFilter === 'ratenkredit') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#60a5fa] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                      <span>Ratenkredite: Bereits getilgt ({ratenPaidPct.toFixed(1)}% • {fmt(ratenPaid)})</span>
                    </span>
                    <span className="text-[#f87171] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f87171]" />
                      <span>Restschuld ({fmt(ratenRest)})</span>
                    </span>
                  </div>

                  <div className="h-3 w-full bg-[#0e1b17] rounded-full overflow-hidden flex p-0.5 border border-[#224037]">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, ratenPaidPct))}%` }}
                      className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] rounded-l-full transition-all duration-500"
                      title={`Ratenkredite getilgt: ${fmt(ratenPaid)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, 100 - ratenPaidPct))}%` }}
                      className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] rounded-r-full transition-all duration-500"
                      title={`Ratenkredite Restschuld: ${fmt(ratenRest)}`}
                    />
                  </div>
                </div>
              )}

              {(kreditFilter === 'alle' || kreditFilter === 'immobilie') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4ade80] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      <span>Immobilienkredite: Bereits getilgt ({immoPaidPct.toFixed(1)}% • {fmt(immoPaid)})</span>
                    </span>
                    <span className="text-[#f87171] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f87171]" />
                      <span>Restschuld ({fmt(immoRest)})</span>
                    </span>
                  </div>

                  <div className="h-3 w-full bg-[#0e1b17] rounded-full overflow-hidden flex p-0.5 border border-[#224037]">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, immoPaidPct))}%` }}
                      className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-l-full transition-all duration-500"
                      title={`Immobilienkredite getilgt: ${fmt(immoPaid)}`}
                    />
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, 100 - immoPaidPct))}%` }}
                      className="h-full bg-gradient-to-r from-[#ef4444] to-[#f87171] rounded-r-full transition-all duration-500"
                      title={`Immobilienkredite Restschuld: ${fmt(immoRest)}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'energie':
        return <EnergieCockpit key="energie" energie={energie} onNavigate={onNavigate} />;

      case 'gehalt':
        return <GehaltCockpit key="gehalt" lohn={lohn} onNavigate={onNavigate} />;

      case 'portfolio':
        return <PortfolioCockpit key="portfolio" portfolio={portfolio} onNavigate={onNavigate} />;

      default:
        return null;
    }
  };

  const visibleCockpits = cockpitConfig.filter((item) => item.visible);

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Cockpits rendered in user-configured order */}
      {visibleCockpits.map((item) => renderCockpitModule(item.id))}

      {visibleCockpits.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <EyeOff className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Alle Cockpit-Kacheln sind ausgeblendet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sie haben aktuell alle Cockpit-Module deaktiviert. Klicken Sie unten auf den Button, um Ihre Cockpits wieder anzupassen und zu aktivieren.
          </p>
        </div>
      )}

      {/* Button ganz unten: Einstellungen & Sortierung */}
      <div className="pt-4 flex justify-center">
        <button
          type="button"
          onClick={handleOpenSettings}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0f766e] group-hover:rotate-90 transition-transform duration-300" />
          <span>Cockpits anpassen &amp; sortieren</span>
        </button>
      </div>

      {/* Modal: Cockpit Einstellungen & Sortierung */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#0f766e] flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Cockpits anpassen</h3>
                  <p className="text-xs text-slate-500">Ein-/Ausschalten &amp; Reihenfolge festlegen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {draftConfig.map((item, index) => {
                const meta = COCKPIT_META[item.id];
                const IconComp = meta ? meta.icon : SlidersHorizontal;
                const isFirst = index === 0;
                const isLast = index === draftConfig.length - 1;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.visible
                        ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-100/50 border-slate-200/60 opacity-60'
                    }`}
                  >
                    {/* Drag / Up-Down Controls & Icon + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Nach oben verschieben"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Nach unten verschieben"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                        <IconComp className="w-4 h-4 text-[#0f766e]" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                          {meta?.title || item.id}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{meta?.subtitle}</p>
                      </div>
                    </div>

                    {/* Visible Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        item.visible
                          ? 'bg-[#dcfce7] text-[#15803d] border border-[#86efac]'
                          : 'bg-slate-200 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {item.visible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aktiv</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aus</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetSettings}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                title="Standard wiederherstellen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Standard</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14231f] hover:bg-[#1a332c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#86efac]" />
                  <span>Speichern</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

