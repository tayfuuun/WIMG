import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  Plus,
  Trash2,
  TrendingDown,
  CalendarClock,
  Landmark,
  X,
  Edit3,
  Home,
  CreditCard,
  Filter,
  Info,
  Calendar,
  ChevronDown,
  Check,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Kredit, KreditCategory } from '../types';
import { fmt, fmtNumber, parseNum, generateId } from '../utils/formatters';
import { FormattedAmountInput } from './FormattedAmountInput';
import { KrediteCockpit } from './KrediteCockpit';
import {
  calculateCurrentRestDebt,
  calculateMonthlyRate,
  calculateTotalAmount,
  getElapsedMonths,
  simulateLoanAmortization,
} from '../utils/creditCalculator';
import { TRANSLATIONS } from '../i18n/translations';

const MONTHS = [
  { value: 1, label: 'Januar' },
  { value: 2, label: 'Februar' },
  { value: 3, label: 'März' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Dezember' },
];

const YEARS = Array.from({ length: 30 }, (_, i) => 2012 + i);

const LAUFZEIT_OPTIONS = [
  ...Array.from({ length: 20 }, (_, i) => {
    const yr = i + 1;
    return {
      years: yr,
      label: `${yr} ${yr === 1 ? 'Jahr' : 'Jahre'} (${yr * 12} Monate)`,
    };
  }),
  { years: 25, label: '25 Jahre (300 Monate)' },
  { years: 30, label: '30 Jahre (360 Monate)' },
];

/**
 * Compact Category Dropdown:
 * In closed state: Only displays the category icon (fits comfortably in table cells).
 * In opened state: Displays both icon and text.
 */
const KategorieDropdown: React.FC<{
  kategorie?: KreditCategory;
  onChange: (cat: KreditCategory) => void;
}> = ({ kategorie = 'ratenkredit', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isImmo = kategorie === 'immobilie';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={isImmo ? 'Immobilienkredit (Klicken zum Ändern)' : 'Ratenkredit (Klicken zum Ändern)'}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
          isImmo
            ? 'bg-[#dcfce7] text-[#15803d] border-[#86efac] hover:bg-[#bbf7d0]'
            : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe] hover:bg-[#dbeafe]'
        }`}
      >
        {isImmo ? 'Immobilie' : 'Ratenkredit'}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-1 w-44 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              onChange('ratenkredit');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-left ${
              !isImmo ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <span>Ratenkredit</span>
            {!isImmo && <Check className="w-3.5 h-3.5 text-[#1d4ed8]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              onChange('immobilie');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-left ${
              isImmo ? 'bg-[#dcfce7] text-[#15803d]' : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
          >
            <span>Immobilienkredit</span>
            {isImmo && <Check className="w-3.5 h-3.5 text-[#15803d]" />}
          </button>
        </div>
      )}
    </div>
  );
};

interface KrediteTabProps {
  kredite: Kredit[];
  onUpdateKredite: (kredite: Kredit[]) => void;
  categoryFilter?: 'all' | KreditCategory;
  onCategoryFilterChange?: (cat: 'all' | KreditCategory) => void;
}

export const KrediteTab: React.FC<KrediteTabProps> = ({
  kredite,
  onUpdateKredite,
  categoryFilter: controlledCategoryFilter,
  onCategoryFilterChange,
}) => {
  const t = TRANSLATIONS.de;
  const tk = t.krediteTab;
  const currencySymbol = '€';

  // Category filter tab: 'all' | 'ratenkredit' | 'immobilie'
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<'all' | KreditCategory>('all');
  const categoryFilter = controlledCategoryFilter !== undefined ? controlledCategoryFilter : internalCategoryFilter;

  const handleSetCategoryFilter = (cat: 'all' | KreditCategory) => {
    setInternalCategoryFilter(cat);
    onCategoryFilterChange?.(cat);
  };

  // Modal state for editing a specific loan
  const [editingKredit, setEditingKredit] = useState<Kredit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered loans based on active category filter tab
  const displayedKredite = kredite.filter((k) => {
    if (categoryFilter === 'all') return true;
    const cat = k.kategorie || 'ratenkredit';
    if (categoryFilter === 'ratenkredit' || categoryFilter === 'konsum') {
      return cat === 'ratenkredit' || cat === 'konsum';
    }
    return cat === categoryFilter;
  });

  // Category-specific breakdowns (verwendet calculateCurrentRestDebt für dynamischen monatlichen Abzug)
  const ratenKredite = kredite.filter((k) => {
    const cat = k.kategorie || 'ratenkredit';
    return cat === 'ratenkredit' || cat === 'konsum';
  });
  const activeRaten = ratenKredite.filter((k) => k.active !== false);
  const ratenDebt = activeRaten.filter((k) => !k.isBausparer);
  const ratenRest = ratenDebt.reduce((s, k) => s + calculateCurrentRestDebt(k), 0);
  const ratenOriginal = ratenDebt.reduce((s, k) => s + parseNum(k.gesamtbetrag), 0);
  const ratenPaid = Math.max(0, ratenOriginal - ratenRest);
  const ratenPaidPct = ratenOriginal > 0 ? (ratenPaid / ratenOriginal) * 100 : 0;
  const ratenRate = activeRaten.reduce((s, k) => s + parseNum(k.rate_monat || 0), 0);
  const ratenInterestPaid = activeRaten.reduce(
    (sum, k) => sum + Math.max(0, parseNum(k.gesamtbetrag) - parseNum(k.betrag)),
    0
  );

  const immoKredite = kredite.filter((k) => k.kategorie === 'immobilie');
  const activeImmo = immoKredite.filter((k) => k.active !== false);
  const immoDebt = activeImmo.filter((k) => !k.isBausparer);
  const immoBauspar = activeImmo.filter((k) => !!k.isBausparer);
  const immoRest = immoDebt.reduce((s, k) => s + calculateCurrentRestDebt(k), 0);
  const immoBausparGuthaben = immoBauspar.reduce((s, k) => s + calculateCurrentRestDebt(k), 0);
  const immoOriginal = immoDebt.reduce((s, k) => s + parseNum(k.gesamtbetrag), 0);
  const immoPaid = Math.max(0, immoOriginal - immoRest);
  const immoPaidPct = immoOriginal > 0 ? (immoPaid / immoOriginal) * 100 : 0;
  const immoRate = activeImmo.reduce((s, k) => s + parseNum(k.rate_monat || 0), 0);
  const immoInterestPaid = activeImmo.reduce(
    (sum, k) => sum + Math.max(0, parseNum(k.gesamtbetrag) - parseNum(k.betrag)),
    0
  );

  // Computations for all active loans: Trennung Schulden vs. Guthaben (Bausparer)
  const allActiveKredite = kredite.filter((k) => k.active !== false);
  const allDebtKredite = allActiveKredite.filter((k) => !k.isBausparer);
  const allBausparKredite = allActiveKredite.filter((k) => !!k.isBausparer);

  const allRestDebt = allDebtKredite.reduce((sum, k) => sum + calculateCurrentRestDebt(k), 0);
  const allBausparGuthaben = allBausparKredite.reduce((sum, k) => sum + calculateCurrentRestDebt(k), 0);
  const allOriginalDebt = allDebtKredite.reduce((sum, k) => sum + parseNum(k.gesamtbetrag), 0);
  const allPaidDebt = Math.max(0, allOriginalDebt - allRestDebt);
  const allPaidPercent = allOriginalDebt > 0 ? (allPaidDebt / allOriginalDebt) * 100 : 0;
  const allMonthlyRate = allActiveKredite.reduce((sum, k) => sum + parseNum(k.rate_monat || 0), 0);
  const allInterestPaid = allActiveKredite.reduce(
    (sum, k) => sum + Math.max(0, parseNum(k.gesamtbetrag) - parseNum(k.betrag)),
    0
  );

  // Dynamic values depending on active categoryFilter selection
  const isSelectedRatenOrKonsum = categoryFilter === 'ratenkredit' || categoryFilter === 'konsum';

  const selectedActiveKredite =
    isSelectedRatenOrKonsum
      ? activeRaten
      : categoryFilter === 'immobilie'
      ? activeImmo
      : allActiveKredite;

  const currentTotalCount =
    isSelectedRatenOrKonsum
      ? ratenKredite.length
      : categoryFilter === 'immobilie'
      ? immoKredite.length
      : kredite.length;

  const currentRestDebt =
    isSelectedRatenOrKonsum
      ? ratenRest
      : categoryFilter === 'immobilie'
      ? immoRest
      : allRestDebt;

  const currentBausparGuthaben =
    isSelectedRatenOrKonsum
      ? 0
      : categoryFilter === 'immobilie'
      ? immoBausparGuthaben
      : allBausparGuthaben;

  const currentOriginalDebt =
    isSelectedRatenOrKonsum
      ? ratenOriginal
      : categoryFilter === 'immobilie'
      ? immoOriginal
      : allOriginalDebt;

  const currentPaidDebt =
    isSelectedRatenOrKonsum
      ? ratenPaid
      : categoryFilter === 'immobilie'
      ? immoPaid
      : allPaidDebt;

  const currentPaidPercent =
    isSelectedRatenOrKonsum
      ? ratenPaidPct
      : categoryFilter === 'immobilie'
      ? immoPaidPct
      : allPaidPercent;

  const currentMonthlyRate =
    isSelectedRatenOrKonsum
      ? ratenRate
      : categoryFilter === 'immobilie'
      ? immoRate
      : allMonthlyRate;

  const currentInterestPaid =
    isSelectedRatenOrKonsum
      ? ratenInterestPaid
      : categoryFilter === 'immobilie'
      ? immoInterestPaid
      : allInterestPaid;

  // Baseline loan amortization calculation
  const baseSim = useMemo(
    () => simulateLoanAmortization(selectedActiveKredite, 0),
    [selectedActiveKredite]
  );

  const handleToggleActive = (id: string) => {
    onUpdateKredite(
      kredite.map((k) => {
        if (k.id !== id) return k;
        const currentActive = k.active !== false;
        return { ...k, active: !currentActive };
      })
    );
  };

  const handleUpdateField = (id: string, field: keyof Kredit, value: any) => {
    const numericFields: (keyof Kredit)[] = ['betrag', 'gesamtbetrag', 'zins', 'restbetrag', 'rate_monat'];
    onUpdateKredite(
      kredite.map((k) => {
        if (k.id !== id) return k;
        return {
          ...k,
          [field]: numericFields.includes(field) ? parseNum(value) : value,
        };
      })
    );
  };

  const handleDelete = (id: string) => {
    onUpdateKredite(kredite.filter((k) => k.id !== id));
    if (editingKredit?.id === id) {
      setEditingKredit(null);
    }
  };

  const handleAddKredit = () => {
    const defaultCat: KreditCategory = categoryFilter === 'immobilie' ? 'immobilie' : 'ratenkredit';
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const isImmo = defaultCat === 'immobilie';
    const netto = isImmo ? 150000 : 10000;
    const zins = isImmo ? 3.8 : 4.9;
    const laufzeit = isImmo ? 20 : 5;
    const calculatedRate = calculateMonthlyRate(netto, zins, laufzeit);
    const gesamt = calculateTotalAmount(calculatedRate, laufzeit);

    const newKredit: Kredit = {
      id: generateId('kredit'),
      bemerkung: isImmo ? 'Immobiliendarlehen' : 'Neuer Ratenkredit',
      institut: 'Hausbank',
      betrag: netto,
      gesamtbetrag: gesamt,
      zins: zins,
      laufzeitJahre: laufzeit,
      startMonat: curMonth,
      startJahr: curYear,
      lastUpdateMonat: curMonth,
      lastUpdateJahr: curYear,
      restbetrag: netto,
      rate_monat: calculatedRate,
      kategorie: defaultCat,
      link: '',
      collapsed: false,
      active: true,
    };
    onUpdateKredite([...kredite, newKredit]);
    setEditingKredit(newKredit);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKredit) return;
    const now = new Date();
    const finalRest =
      editingKredit.restbetrag !== undefined && editingKredit.restbetrag !== null
        ? Math.max(0, Number(editingKredit.restbetrag))
        : 0;
    const savedKredit: Kredit = {
      ...editingKredit,
      restbetrag: finalRest,
      lastUpdateMonat: now.getMonth() + 1,
      lastUpdateJahr: now.getFullYear(),
    };
    onUpdateKredite(
      kredite.map((k) => (k.id === savedKredit.id ? savedKredit : k))
    );
    setEditingKredit(null);
  };

  const handleNettoChange = (val: number) => {
    if (!editingKredit) return;
    const netto = Math.max(0, val);
    setEditingKredit({
      ...editingKredit,
      betrag: netto,
      restbetrag:
        editingKredit.restbetrag !== undefined && editingKredit.restbetrag !== null
          ? editingKredit.restbetrag
          : netto,
    });
  };

  const handleLaufzeitChange = (years: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      laufzeitJahre: years,
    });
  };

  const handleZinsChange = (zins: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      zins: zins,
    });
  };

  const handleRateChange = (rate: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      rate_monat: Math.max(0, rate),
    });
  };

  const handleRestbetragChange = (val: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      restbetrag: Math.max(0, val),
    });
  };

  const handleGesamtbetragChange = (gesamt: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      gesamtbetrag: Math.max(0, gesamt),
    });
  };

  const handleStartDateChange = (month: number, year: number) => {
    if (!editingKredit) return;
    setEditingKredit({
      ...editingKredit,
      startMonat: month,
      startJahr: year,
    });
  };

  const renderCreditCard = (k: Kredit) => {
    const isActive = k.active !== false;
    const isBausparer = !!k.isBausparer;
    const isEndfaellig = k.tilgungsart === 'endfaellig';
    const totalCost = parseNum(k.gesamtbetrag);
    const rest = calculateCurrentRestDebt(k);
    const paid = isBausparer ? rest : Math.max(0, totalCost - rest);
    const pctPaid = totalCost > 0 ? (paid / totalCost) * 100 : 0;
    const monthlyRate = parseNum(k.rate_monat || 0);
    const isImmo = k.kategorie === 'immobilie';

    // Duration (Laufzeit) calculation & timeline metrics
    const startMonat = k.startMonat || 1;
    const startJahr = k.startJahr || new Date().getFullYear();
    const laufzeitJahre = k.laufzeitJahre || 5;
    const totalMonths = Math.round(Math.max(1, laufzeitJahre * 12));
    const elapsedMonths = Math.round(getElapsedMonths(startJahr, startMonat));
    const clampedElapsed = Math.min(totalMonths, Math.max(0, elapsedMonths));
    const remainingMonths = Math.max(0, totalMonths - clampedElapsed);
    const pctTimeElapsed = Math.min(100, Math.max(0, (clampedElapsed / totalMonths) * 100));
    const pctTimeRemaining = 100 - pctTimeElapsed;

    const formatEndDate = (sYear: number, sMonth: number, totMonths: number) => {
      const startTotalMonths = (sYear * 12) + (sMonth - 1);
      const endTotalMonths = Math.round(startTotalMonths + totMonths);
      const endYear = Math.floor(endTotalMonths / 12);
      const endMonth = (endTotalMonths % 12) + 1;
      const padMonth = endMonth < 10 ? `0${endMonth}` : `${endMonth}`;
      return `${padMonth}/${endYear}`;
    };

    const startFormatted = `${startMonat < 10 ? '0' : ''}${startMonat}/${startJahr}`;
    const endFormatted = formatEndDate(startJahr, startMonat, totalMonths);
    const isBallonSchlussrate = !isBausparer && rest > 0 && clampedElapsed >= totalMonths;

    const formatLaufzeitText = (totalM: number) => {
      if (totalM <= 0) return '0 Monate';
      if (totalM >= 12) {
        const years = Math.floor(totalM / 12);
        const months = Math.round(totalM % 12);
        const yearStr = years === 1 ? '1 Jahr' : `${years} Jahre`;
        if (months === 0) return yearStr;
        const monthStr = months === 1 ? '1 Monat' : `${months} Monate`;
        return `${yearStr} ${monthStr}`;
      } else {
        const m = Math.round(totalM);
        return `${m} ${m === 1 ? 'Monat' : 'Monate'}`;
      }
    };

    const restlaufzeitText = formatLaufzeitText(remainingMonths);

    // Color schema based on whether it is Bausparer (asset = teal/emerald green/blue), Immo (green), or Ratenkredit (blue)
    // Color schema based on whether it is Bausparer (asset = teal/emerald green/blue), Immo (green), or Ratenkredit (neutral clean)
    const cardBg = isActive
      ? isBausparer
        ? 'bg-[#f0fdfa] border-[#99f6e4] hover:border-[#5eead4]'
        : isImmo
        ? 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#86efac]'
        : 'bg-white border border-slate-200/80 hover:border-slate-300'
      : 'bg-slate-50/60 border border-slate-200/60 opacity-60 hover:opacity-85';

    const titleColor = isBausparer
      ? isActive ? 'text-[#0f766e]' : 'text-[#0f766e]/60 line-through'
      : isImmo
      ? isActive ? 'text-[#166534]' : 'text-[#166534]/60 line-through'
      : isActive ? 'text-slate-900' : 'text-slate-500 line-through';

    return (
      <div
        key={k.id}
        className={`rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-sm relative ${cardBg}`}
      >
        <div>
          {/* Top Row: Checkbox + Title (Full width) */}
          <div className="flex items-start gap-2.5 min-w-0">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => handleToggleActive(k.id)}
              className={`w-4 h-4 rounded border-slate-300 cursor-pointer shrink-0 mt-0.5 ${
                isBausparer
                  ? 'text-[#0d9488] focus:ring-[#0d9488]'
                  : isImmo
                  ? 'text-[#16a34a] focus:ring-[#16a34a]'
                  : 'text-blue-600 focus:ring-blue-600'
              }`}
              title={isActive ? 'Kredit abwählen' : 'Kredit anwählen'}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <span className={`text-sm font-extrabold uppercase tracking-wider break-words block ${titleColor}`}>
                {k.bemerkung || k.name || 'Kredit'}
              </span>

              {/* Subrow: Bank Name + Badges under title */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs text-slate-500 font-medium">
                  {k.bank || k.institut || tk.noBank}
                </span>
                {isBausparer && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4] shrink-0">
                    Guthaben / Bausparer
                  </span>
                )}
                {isEndfaellig && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a] shrink-0">
                    Endfällig
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Restschuld / Bausparguthaben & Monthly Installment (Mobile 50% / 50%) */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                {isBausparer ? 'Aktuelles Guthaben' : t.topBar.remainingDebt}
              </span>
              <div className={`text-lg sm:text-xl font-bold mt-0.5 tabular-nums whitespace-nowrap truncate ${
                isBausparer ? 'text-teal-600' : 'text-rose-600'
              }`}>
                {fmt(rest)}
              </div>
              {isBallonSchlussrate && (
                <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
                  (Schlussrate/Ballon)
                </span>
              )}
            </div>

            <div className="text-right min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                {isBausparer ? 'Monatliche Sparrate' : isEndfaellig ? 'Zinsrate (monatlich)' : tk.monthlyPayment}
              </span>
              <div className="text-lg sm:text-xl font-bold mt-0.5 text-slate-800 tabular-nums whitespace-nowrap truncate">
                {fmt(monthlyRate)} <span className="text-xs font-normal text-slate-500">/ Mo.</span>
              </div>
            </div>
          </div>

          {/* Tilgungs-Fortschrittsbalken Section */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            {/* Header: Laufzeit & % Getilgt */}
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold">
                Laufzeit: {formatLaufzeitText(totalMonths)} ({k.zins}% Zinsen)
              </span>
              <span className="font-extrabold text-emerald-600 tabular-nums">
                {isBausparer
                  ? `${((rest / (k.betrag || 1)) * 100).toFixed(1)}% angespart`
                  : `${pctPaid.toFixed(1)}% Getilgt`}
              </span>
            </div>

            {/* Single Tilgungs-Fortschrittsbalken */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                style={{ width: `${Math.min(100, Math.max(0, pctPaid))}%` }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                title={`Getilgt: ${pctPaid.toFixed(1)}%`}
              />
            </div>

            {/* Timeline: Start & Ende */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
              <span>Start: <strong className="text-slate-700 font-semibold">{startFormatted}</strong></span>
              <span>Ende: <strong className="text-slate-700 font-semibold">{endFormatted}</strong></span>
            </div>

            {/* Eigene Zeile für Restlaufzeit */}
            <div className="flex items-center justify-between text-xs bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/70">
              <span className="text-slate-600 font-medium">Verbleibende Restlaufzeit:</span>
              <strong className="text-slate-900 font-extrabold tabular-nums">{restlaufzeitText}</strong>
            </div>

            {/* Betragstransparenz: Kreditsumme vs Gesamtaufwand */}
            <div className="pt-2 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-1">
              <span>Kreditsumme: <strong className="text-slate-700 font-semibold">{fmt(k.betrag)}</strong></span>
              <span>Gesamtaufwand: <strong className="text-slate-800 font-bold">{fmt(totalCost)}</strong> <span className="text-[10px] text-slate-400">(inkl. Zinsen)</span></span>
            </div>

            {/* Notizen Vorschau falls vorhanden */}
            {k.notizen && (
              <div className="pt-1.5 text-xs text-slate-500 italic flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 not-italic" />
                <span>{k.notizen}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer Row: Bank-Portal link above, then Bearbeiten line, then Löschen line */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col gap-2">
          {k.link && (
            <a
              href={k.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Bank-Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setEditingKredit({ ...k, restbetrag: calculateCurrentRestDebt(k) })}
            className="w-full py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            title={tk.editCredit}
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Bearbeiten</span>
          </button>

          {deleteConfirmId === k.id ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDelete(k.id);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Ja, Kredit löschen
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmId(k.id)}
              className="w-full py-1.5 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Kredit löschen"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Löschen</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="kredite-view-container" className="space-y-6 pb-12">
      {/* 0. Sticky Dark-Green Kredit-Cockpit Header */}
      <KrediteCockpit
        monthlyRate={currentMonthlyRate}
        restDebt={currentRestDebt}
        paidPercent={currentPaidPercent}
        paidDebt={currentPaidDebt}
        debtFreeDate={baseSim.dateDisplay}
        activeCount={selectedActiveKredite.length}
        totalCount={currentTotalCount}
      />

      {/* 1. Debt Status & Progress Bar (Cockpit Dark Luxury Design) */}
      <div className="mt-4 sm:mt-6 bg-[#10231d] rounded-3xl p-5 sm:p-6 border border-[#244b3f] shadow-2xl relative overflow-hidden text-white">
        {/* Background glow effect */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Big Tilgungsbalken */}
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-[#8ea69d] mb-2 flex-wrap gap-1">
            <span className="uppercase tracking-wider">Tilgungsfortschritt</span>
            <span className="text-white font-extrabold tabular-nums">
              {currentPaidPercent.toFixed(1)}% getilgt
            </span>
          </div>

          <div className="h-4 w-full bg-[#0c1814] rounded-full overflow-hidden p-0.5 border border-[#244b3f]">
            <div
              style={{ width: `${Math.min(100, Math.max(0, currentPaidPercent))}%` }}
              className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-full transition-all duration-500"
              title={`Bereits getilgt: ${fmt(currentPaidDebt)} (${currentPaidPercent.toFixed(1)}%)`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 text-xs text-[#94a3b8]">
            <span>
              {tk.original}: <strong className="text-white font-bold">{fmt(currentOriginalDebt)}</strong>
            </span>
            <span>
              {tk.totalInterest}: <strong className="text-[#fcd34d] font-bold">{fmt(currentInterestPaid)}</strong>
            </span>
          </div>
        </div>

        {/* Category Dual Breakdown Cards: Ratenkredite vs Immobilienkredite */}
        <div className="mt-5 pt-4 border-t border-[#23443b]/70 grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
          {/* Category: Ratenkredit (Konsum) */}
          <button
            type="button"
            onClick={() => handleSetCategoryFilter(categoryFilter === 'ratenkredit' ? 'all' : 'ratenkredit')}
            className={`p-4 rounded-2xl border transition-all text-left cursor-pointer group backdrop-blur-md ${
              categoryFilter === 'ratenkredit'
                ? 'bg-[#132c3f]/95 border-[#3b82f6] ring-2 ring-[#3b82f6]/60 shadow-blue-900/30'
                : 'bg-[#18362d]/90 hover:bg-[#1c3f35] border-[#2b5548] hover:border-[#3b6b5a]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#2563eb]/20 text-[#60a5fa] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#60a5fa]">
                    {tk.categoryRaten}
                  </h4>
                  <span className="text-[11px] text-[#cbd5e1] block">
                    {ratenKredite.length} Kredite ({activeRaten.length} aktiv)
                  </span>
                  {categoryFilter === 'ratenkredit' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#2563eb] text-white text-[10px] font-extrabold uppercase tracking-wide">
                      Ausgewählt
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 border border-[#22c55e]/30 text-[#4ade80] text-[11px] font-bold whitespace-nowrap">
                  {ratenPaidPct.toFixed(1)}% getilgt
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Restschuld</span>
                <span className="text-lg font-black text-[#fca5a5] tabular-nums">{fmt(ratenRest)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Abtrag</span>
                <span className="text-sm font-bold text-[#60a5fa] tabular-nums">{fmt(ratenRate)} / Mo.</span>
              </div>
            </div>
          </button>

          {/* Category: Immobilienkredit (Immo) */}
          <button
            type="button"
            onClick={() => handleSetCategoryFilter(categoryFilter === 'immobilie' ? 'all' : 'immobilie')}
            className={`p-4 rounded-2xl border transition-all text-left cursor-pointer group backdrop-blur-md ${
              categoryFilter === 'immobilie'
                ? 'bg-[#123628]/95 border-[#22c55e] ring-2 ring-[#22c55e]/60 shadow-emerald-900/30'
                : 'bg-[#18362d]/90 hover:bg-[#1c3f35] border-[#2b5548] hover:border-[#3b6b5a]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#16a34a]/20 text-[#4ade80] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4ade80]">
                    {tk.categoryImmo}
                  </h4>
                  <span className="text-[11px] text-[#cbd5e1] block">
                    {immoKredite.length} Kredite ({activeImmo.length} aktiv)
                  </span>
                  {categoryFilter === 'immobilie' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#16a34a] text-white text-[10px] font-extrabold uppercase tracking-wide">
                      Ausgewählt
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 border border-[#22c55e]/30 text-[#4ade80] text-[11px] font-bold whitespace-nowrap">
                  {immoPaidPct.toFixed(1)}% getilgt
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-white/5">
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Restschuld</span>
                <span className="text-lg font-black text-[#fca5a5] tabular-nums">{fmt(immoRest)}</span>
                {immoBausparGuthaben > 0 && (
                  <span className="text-[10px] text-[#2dd4bf] font-bold block mt-0.5">
                    + {fmt(immoBausparGuthaben)} Bausparguthaben
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Abtrag</span>
                <span className="text-sm font-bold text-[#4ade80] tabular-nums">{fmt(immoRate)} / Mo.</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Visual Credit Cards Section divided by Category: Ratenkredite vs Immobiliendarlehen */}
      <div className="space-y-8">
        {/* SECTION: RATENKREDITE */}
        {(categoryFilter === 'all' || categoryFilter === 'ratenkredit') && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#1e40af]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#eff6ff] text-[#1e40af] flex items-center justify-center font-bold shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1e3a8a] tracking-tight flex items-center gap-2">
                    <span>Ratenkredite</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#dbeafe] text-[#1d4ed8]">
                      {ratenKredite.length} {ratenKredite.length === 1 ? 'Kredit' : 'Kredite'}
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {ratenKredite.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ratenKredite.map(renderCreditCard)}
              </div>
            ) : (
              <div className="py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-[#cbd5e1]">
                <CreditCard className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#64748b]">
                  Keine Ratenkredite vorhanden.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SECTION: IMMOBILIENDARLEHEN */}
        {(categoryFilter === 'all' || categoryFilter === 'immobilie') && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#16a34a]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#f0fdf4] text-[#15803d] flex items-center justify-center font-bold shadow-2xs">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#166534] tracking-tight flex items-center gap-2">
                    <span>Immobiliendarlehen &amp; Baufinanzierung</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                      {immoKredite.length} {immoKredite.length === 1 ? 'Kredit' : 'Kredite'}
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {immoKredite.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {immoKredite.map(renderCreditCard)}
              </div>
            ) : (
              <div className="py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-[#cbd5e1]">
                <Home className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#64748b]">
                  Keine Immobiliendarlehen vorhanden.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Global fallback if absolutely no loans exist */}
        {kredite.length === 0 && (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-[#cbd5e1]">
            <CreditCard className="w-10 h-10 text-[#94a3b8] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#1e293b]">Noch keine Kredite angelegt</h4>
            <p className="text-xs text-[#64748b] mt-1 mb-4">
              Füge deinen ersten Ratenkredit oder dein Immobiliendarlehen hinzu.
            </p>
            <button
              type="button"
              onClick={handleAddKredit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kredit hinzufügen</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Bar: Add Credit full width at the bottom */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={handleAddKredit}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>{tk.addCredit}</span>
        </button>
      </div>

      {/* 4. Edit Modal for Credit Position */}
      {editingKredit && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-white sm:bg-black/60 sm:backdrop-blur-xs sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-3xl shadow-2xl sm:border sm:border-[#cbd5e1] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#e2e8f0] bg-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a] leading-tight truncate">
                    {tk.modalTitleEdit}
                  </h3>
                  <p className="text-[11px] text-[#64748b] truncate">
                    {editingKredit.bemerkung || 'Kreditdetails bearbeiten'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingKredit(null)}
                className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer shrink-0"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            {(() => {
              const curNetto = editingKredit.betrag !== undefined ? editingKredit.betrag : 0;
              const curZins = editingKredit.zins !== undefined ? editingKredit.zins : 0;
              const curLaufzeit = editingKredit.laufzeitJahre || 5;
              const curRate = editingKredit.rate_monat !== undefined ? editingKredit.rate_monat : 0;
              const curStartMonat = editingKredit.startMonat || 1;
              const curStartJahr = editingKredit.startJahr || new Date().getFullYear();
              const calculatedRestDebt = calculateCurrentRestDebt(editingKredit);
              const elapsedMonths = getElapsedMonths(curStartMonat, curStartJahr);

              return (
                <form onSubmit={handleSaveModal} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4.5 overscroll-contain">
                    {/* 1. Kreditkategorie & Finanzierungsart */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                        {tk.loanCategoryLabel}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingKredit({ ...editingKredit, kategorie: 'ratenkredit' })}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                            (editingKredit.kategorie || 'ratenkredit') === 'ratenkredit'
                              ? 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] font-bold shadow-xs'
                              : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">Ratenkredit</span>
                            <span className="text-[10px] text-[#64748b] block truncate">Konsum &amp; Raten</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingKredit({ ...editingKredit, kategorie: 'immobilie' })}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                            editingKredit.kategorie === 'immobilie'
                              ? 'bg-[#dcfce7] border-[#22c55e] text-[#15803d] font-bold shadow-xs'
                              : 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]'
                          }`}
                        >
                          <Home className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">Immobilienkredit</span>
                            <span className="text-[10px] text-[#64748b] block truncate">Baufinanzierung</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Tilgungsart & Bausparer-Option */}
                    <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] space-y-3">
                      <div>
                        <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                          Tilgungsart
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...editingKredit, tilgungsart: 'annuitaet' as const };
                              setEditingKredit(next);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              editingKredit.tilgungsart !== 'endfaellig'
                                ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            Annuitätendarlehen
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...editingKredit, tilgungsart: 'endfaellig' as const };
                              setEditingKredit(next);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              editingKredit.tilgungsart === 'endfaellig'
                                ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                            }`}
                          >
                            Endfälliges Darlehen
                          </button>
                        </div>
                        <span className="text-[10px] text-[#64748b] mt-1 block">
                          {editingKredit.tilgungsart === 'endfaellig'
                            ? 'Restschuld bleibt konstant gleich dem Ursprungsbetrag. Rate besteht nur aus Zinsen.'
                            : 'Monatliche Rate tilgt die Restschuld fortlaufend (Standard-Bankdarlehen).'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#e2e8f0]">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!editingKredit.isBausparer}
                            onChange={(e) =>
                              setEditingKredit({ ...editingKredit, isBausparer: e.target.checked })
                            }
                            className="w-4 h-4 text-[#0d9488] rounded border-[#cbd5e1] focus:ring-[#0d9488]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#0f172a] block">
                              Bausparvertrag (Guthaben)
                            </span>
                            <span className="text-[10px] text-[#64748b] block">
                              Wird als Vermögenswert/Guthaben gewertet (Kachel grün/blau), Rate addiert sich zum Guthaben.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* 2. Bezeichnung */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        {tk.purposeLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingKredit.bemerkung}
                        onChange={(e) =>
                          setEditingKredit({ ...editingKredit, bemerkung: e.target.value })
                        }
                        placeholder="z. B. Autokredit oder Baufinanzierung EFH"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm text-[#0f172a] font-medium focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* 3. Bank / Institut */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        {tk.instituteLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={editingKredit.institut}
                        onChange={(e) =>
                          setEditingKredit({ ...editingKredit, institut: e.target.value })
                        }
                        placeholder="z. B. ING, DKB, Sparkasse"
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm text-[#0f172a] font-medium focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* 4. Startdatum (unter Bank mit Jahr und Monatsauswahl) */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1e3a8a]" />
                        <span>Startdatum des Darlehens (Monat &amp; Jahr)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <select
                            value={curStartMonat}
                            onChange={(e) =>
                              handleStartDateChange(parseInt(e.target.value, 10), curStartJahr)
                            }
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm text-[#0f172a] font-medium focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors cursor-pointer"
                          >
                            {MONTHS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label} ({m.value < 10 ? `0${m.value}` : m.value})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <select
                            value={curStartJahr}
                            onChange={(e) =>
                              handleStartDateChange(curStartMonat, parseInt(e.target.value, 10))
                            }
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm text-[#0f172a] font-medium focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors cursor-pointer"
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 5. Nettodarlehen */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Nettodarlehen (Auszahlungsbetrag)
                      </label>
                      <div className="relative">
                        <FormattedAmountInput
                          value={editingKredit.betrag !== undefined ? editingKredit.betrag : ''}
                          onChange={(val) => handleNettoChange(val)}
                          decimals={2}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors tabular-nums pr-9"
                          placeholder="0,00"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748b]">
                          {currencySymbol}
                        </span>
                      </div>
                    </div>

                    {/* 6. Laufzeit in Jahren (Dropdown 1-20 Jahre mit Monaten) */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Laufzeit in Jahren
                      </label>
                      <select
                        value={curLaufzeit}
                        onChange={(e) => handleLaufzeitChange(parseInt(e.target.value, 10))}
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors cursor-pointer"
                      >
                        {LAUFZEIT_OPTIONS.map((opt) => (
                          <option key={opt.years} value={opt.years}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 7. Zinssatz */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Zinssatz (% p.a.)
                      </label>
                      <div className="relative">
                        <FormattedAmountInput
                          value={editingKredit.zins !== undefined ? editingKredit.zins : ''}
                          onChange={(val) => handleZinsChange(val)}
                          decimals={2}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors tabular-nums pr-16"
                          placeholder="z. B. 3,50"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b]">
                          % p.a.
                        </span>
                      </div>
                    </div>

                    {/* 8. Monatlicher Betrag (Abtrag) - Manuelles Inputfeld */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider">
                          Monatliche Rate (Abtrag)
                        </label>
                        <span className="text-[10px] font-bold text-[#1d4ed8] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe]">
                          Manuelle Eingabe
                        </span>
                      </div>
                      <div className="relative">
                        <FormattedAmountInput
                          value={editingKredit.rate_monat !== undefined ? editingKredit.rate_monat : ''}
                          onChange={(val) => handleRateChange(val)}
                          decimals={2}
                          className="w-full bg-[#eff6ff] border border-[#93c5fd] rounded-xl px-3.5 py-2.5 text-base font-black text-[#1e40af] focus:outline-none focus:border-[#2563eb] focus:bg-white transition-colors tabular-nums pr-9"
                          placeholder="0,00"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#1e40af]">
                          {currencySymbol}
                        </span>
                      </div>
                    </div>

                    {/* 9. Gesamtbetrag (inkl. Zinsen & Gebühren) - Manuelles Inputfeld */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                          Gesamtbetrag (inkl. Zinsen &amp; Gebühren)
                        </label>
                        <span className="text-[10px] font-bold text-[#475569] bg-[#f1f5f9] px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                          Manuelle Eingabe
                        </span>
                      </div>
                      <div className="relative">
                        <FormattedAmountInput
                          value={editingKredit.gesamtbetrag !== undefined ? editingKredit.gesamtbetrag : ''}
                          onChange={(val) => handleGesamtbetragChange(val)}
                          decimals={2}
                          className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors tabular-nums pr-9"
                          placeholder="0,00"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748b]">
                          {currencySymbol}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#64748b]">
                        Zinskosten: {fmt(Math.max(0, (editingKredit.gesamtbetrag || 0) - (editingKredit.betrag || 0)))}
                      </p>
                    </div>

                    {/* 10. Restschuld - Manuelle Eingabe, die monatlich automatisch um die Rate verringert wird */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#991b1b] uppercase tracking-wider flex items-center gap-1.5">
                          <span>Restschuld</span>
                        </label>
                        <span className="text-[10px] font-bold text-[#991b1b] bg-[#fee2e2] px-2 py-0.5 rounded-full border border-[#fca5a5]">
                          Manuelle Eingabe
                        </span>
                      </div>
                      <div className="relative">
                        <FormattedAmountInput
                          value={editingKredit.restbetrag !== undefined ? editingKredit.restbetrag : ''}
                          onChange={(val) => handleRestbetragChange(val)}
                          decimals={2}
                          className="w-full bg-[#fef2f2] border-2 border-[#fca5a5] focus:border-[#dc2626] rounded-xl px-3.5 py-2.5 text-base font-black text-[#991b1b] focus:outline-none focus:bg-white transition-colors tabular-nums pr-9"
                          placeholder="0,00"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#991b1b]">
                          {currencySymbol}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-[#64748b]">
                        Gepflegter Stand. Zum 1. jedes Monats wird automatisch die monatliche Rate ({fmt(curRate)}) abgezogen.
                      </p>
                    </div>

                    {/* 12. Link */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        {tk.portalLinkLabel}
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={editingKredit.link || ''}
                        onChange={(e) =>
                          setEditingKredit({ ...editingKredit, link: e.target.value })
                        }
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Notizen / Zinsbindungs-Fristen */}
                    <div>
                      <label className="text-xs font-bold text-[#475569] uppercase tracking-wider block mb-1">
                        Notizen &amp; Zinsbindung
                      </label>
                      <textarea
                        rows={2}
                        placeholder="z. B. Zinsbindung endet am 30.08.2034. Ablösung durch Bausparer..."
                        value={editingKredit.notizen || ''}
                        onChange={(e) =>
                          setEditingKredit({ ...editingKredit, notizen: e.target.value })
                        }
                        className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2 text-sm text-[#0f172a] focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {/* 13. Active Toggle */}
                    <div className="pt-2 border-t border-[#f1f5f9]">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editingKredit.active !== false}
                          onChange={(e) =>
                            setEditingKredit({ ...editingKredit, active: e.target.checked })
                          }
                          className="w-4 h-4 text-[#1e3a8a] rounded border-[#cbd5e1] focus:ring-[#1e3a8a]"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-[#0f172a]">
                          In Berechnungen &amp; Cockpit einbeziehen (Aktiv)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer (Sticky Bottom) */}
                  <div className="p-4 sm:px-6 sm:py-4 border-t border-[#e2e8f0] bg-white sm:bg-[#f8fafc] flex items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(editingKredit.id)}
                      className="px-3 py-2 text-xs font-bold text-[#dc2626] hover:bg-[#fee2e2] rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{tk.delete}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingKredit(null)}
                        className="px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-bold text-[#475569] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                      >
                        {tk.cancel}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold transition-colors shadow-sm cursor-pointer active:scale-95"
                      >
                        {tk.save}
                      </button>
                    </div>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
