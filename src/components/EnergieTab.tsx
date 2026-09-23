import React, { useState } from 'react';
import {
  Zap,
  Flame,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  FileText,
  ShieldCheck,
  TrendingDown,
  Gauge,
  Droplets,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LabelList,
  Rectangle,
} from 'recharts';
import { EnergieCockpit } from './EnergieCockpit';
import { EnergieData, StromVerbrauch } from '../types';
import { fmt, parseNum, getCurrencySymbol } from '../utils/formatters';

// Custom shape for the lower base bar (Ist-Verbrauch)
// Top corners are flat [0, 0, 0, 0] if a forecast bar is stacked above for the current year
// Otherwise [4, 4, 0, 0] for standard solid columns
const renderIstBar = (color: string) => (props: any) => {
  const { payload } = props;
  const hasForecast =
    payload?.isCurrentYear &&
    ((payload.forecastDelta && payload.forecastDelta > 0) ||
      (payload.heizungForecast && payload.heizungForecast > 0) ||
      (payload.wasserForecast && payload.wasserForecast > 0));

  const isStackedBelowHeizung = color === '#0284c7' && ((payload?.heizung || 0) > 0 || (payload?.heizungForecast || 0) > 0);

  return (
    <Rectangle
      {...props}
      fill={color}
      radius={hasForecast || isStackedBelowHeizung ? [0, 0, 0, 0] : [4, 4, 0, 0]}
    />
  );
};

// Custom shape for the upper stacked bar (Prognostizierter Restverbrauch)
// Halbtransparent (fillOpacity: 0.35) mit feiner, gestrichelter Umrandung (1.5px dashed / strokeDasharray="3 3")
const renderForecastBar = (color: string) => (props: any) => {
  const { height, value } = props;
  if (!height || height <= 0 || !value) return null;
  return (
    <Rectangle
      {...props}
      fill={color}
      fillOpacity={0.35}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="3 3"
      radius={[4, 4, 0, 0]}
    />
  );
};



interface EnergieTabProps {
  energie: EnergieData;
  onUpdateEnergie: (energie: EnergieData) => void;
}

export const EnergieTab: React.FC<EnergieTabProps> = ({ energie, onUpdateEnergie }) => {
  const currencySymbol = getCurrencySymbol();
  const [activeSubTab, setActiveSubTab] = useState<'both' | 'strom' | 'gas'>('both');
  const [gasFilter, setGasFilter] = useState<'both' | 'heizung' | 'wasser'>('both');
  const [isStromVertragCollapsed, setIsStromVertragCollapsed] = useState(true);
  const [isGasVertragCollapsed, setIsGasVertragCollapsed] = useState(true);

  const { strom, gas } = energie;

  // Dynamic Run-Rate calculations for the current incomplete year (e.g. 2026)
  const now = new Date();
  const currentYear = now.getFullYear();
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  const startOfYear = new Date(currentYear, 0, 1);
  const diffMs = Math.max(0, now.getTime() - startOfYear.getTime());
  const daysPassed = Math.max(1, Math.min(daysInYear, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1));

  // Chart data for Strom with Run-Rate Projection for incomplete current year
  const stromChartData = [...strom.verbrauch]
    .sort((a, b) => b.jahr - a.jahr)
    .map((v) => {
      const isCurrentYear = v.jahr === currentYear;
      // Run-Rate: projectedTotal = (currentConsumption / daysPassed) * daysInYear
      const projectedTotal =
        isCurrentYear && daysPassed > 0
          ? Math.round((v.kwh / daysPassed) * daysInYear)
          : v.kwh;
      const forecastDelta = isCurrentYear ? Math.max(0, projectedTotal - v.kwh) : 0;

      return {
        jahr: v.jahr.toString(),
        yearNum: v.jahr,
        isCurrentYear,
        kwh: v.kwh,
        zaehlerstand: v.zaehlerstand,
        forecastDelta,
        projectedTotal,
        pastKwhDisplay: !isCurrentYear && v.kwh > 0 ? v.kwh : undefined,
        currentProjectedDisplay: isCurrentYear && projectedTotal > 0 ? projectedTotal : undefined,
      };
    });

  // Chart data for Gas with Run-Rate Projection for incomplete current year
  const gasChartData = [...gas.verbrauch]
    .sort((a, b) => b.jahr - a.jahr)
    .map((v) => {
      const isCurrentYear = v.jahr === currentYear;

      const heizungProjected =
        isCurrentYear && daysPassed > 0
          ? Math.round((v.heizung / daysPassed) * daysInYear)
          : v.heizung;
      const heizungForecast = isCurrentYear ? Math.max(0, heizungProjected - v.heizung) : 0;

      const wasserProjected =
        isCurrentYear && daysPassed > 0
          ? Math.round((v.wasser / daysPassed) * daysInYear)
          : v.wasser;
      const wasserForecast = isCurrentYear ? Math.max(0, wasserProjected - v.wasser) : 0;

      const gesamtIst = v.heizung + v.wasser;
      const gesamtForecast = heizungForecast + wasserForecast;
      const gesamtProjected = heizungProjected + wasserProjected;

      return {
        jahr: v.jahr.toString(),
        yearNum: v.jahr,
        isCurrentYear,
        heizung: v.heizung,
        heizungForecast,
        heizungProjected,
        pastHeizungDisplay: !isCurrentYear && v.heizung > 0 ? v.heizung : undefined,
        currentHeizungProjected: isCurrentYear && heizungProjected > 0 ? heizungProjected : undefined,

        wasser: v.wasser,
        wasserForecast,
        wasserProjected,
        pastWasserDisplay: !isCurrentYear && v.wasser > 0 ? v.wasser : undefined,
        currentWasserProjected: isCurrentYear && wasserProjected > 0 ? wasserProjected : undefined,

        gesamt: gesamtIst,
        gesamtIst,
        gesamtForecast,
        gesamtProjected,
      };
    });

  const pastStromItems = strom.verbrauch.filter(v => v.jahr < currentYear && v.kwh > 0);
  const avgStrom = pastStromItems.length > 0 ? Math.round(pastStromItems.reduce((acc, x) => acc + x.kwh, 0) / pastStromItems.length) : 0;

  const pastGasItems = gas.verbrauch.filter(v => v.jahr < currentYear && ((v.heizung || 0) + (v.wasser || 0) > 0));
  const avgGas = pastGasItems.length > 0 ? Math.round(pastGasItems.reduce((acc, x) => acc + (x.heizung || 0) + (x.wasser || 0), 0) / pastGasItems.length) : 0;



  // Custom inside label for Warmwasser (unten im Balken)
  const renderWasserInsideLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 16) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {Number(value).toLocaleString('de-DE')}
      </text>
    );
  };

  // Custom inside label for Heizung (im Balken)
  const renderHeizungInsideLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value || height < 16) return null;
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {Number(value).toLocaleString('de-DE')}
      </text>
    );
  };

  // Custom top label for "oben alles zusammen" (Summe über dem Balken)
  const renderGasTopTotalLabel = (props: any) => {
    const { x, y, width, index } = props;
    const row = gasChartData[index];
    if (!row) return null;

    let total = 0;
    if (gasFilter === 'both') {
      total = row.isCurrentYear ? (row.gesamtProjected || 0) : ((row.wasser || 0) + (row.heizung || 0));
    } else if (gasFilter === 'heizung') {
      total = row.isCurrentYear ? (row.heizungProjected || 0) : (row.heizung || 0);
    } else {
      total = row.isCurrentYear ? (row.wasserProjected || 0) : (row.wasser || 0);
    }
    if (!total) return null;

    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#0f172a"
        textAnchor="middle"
        fontSize={11}
        fontWeight={800}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {Number(total).toLocaleString('de-DE')}
      </text>
    );
  };

  // Strom handlers
  const handleUpdateStromField = (field: string, value: any) => {
    onUpdateEnergie({
      ...energie,
      strom: {
        ...strom,
        [field]: typeof strom[field as keyof typeof strom] === 'number' ? parseNum(value) : value,
      },
    });
  };

  // Helper to recalculate consumption (kwh) automatically from zaehlerstand (abgelesen zum 01.01. des Folgejahres)
  // oder zaehlerstand - vorjahrZaehlerstand
  const recalculateStromVerbrauch = (verbrauchList: StromVerbrauch[]): StromVerbrauch[] => {
    // Sort ascending by year to compute consecutive difference
    const sorted = [...verbrauchList].sort((a, b) => a.jahr - b.jahr);
    const updated = sorted.map((item, idx) => {
      // Wenn für dieses Jahr ein Zählerstand (zum 01.01. des Folgejahres bzw. Stichtag)
      // und für das Vorjahr ein Zählerstand vorliegt: Differenz = Jahresverbrauch!
      const prevItem = idx > 0 ? sorted[idx - 1] : undefined;
      let calculatedKwh = item.kwh;
      if (item.zaehlerstand !== undefined && item.zaehlerstand !== null && prevItem?.zaehlerstand !== undefined && prevItem?.zaehlerstand !== null) {
        const diff = item.zaehlerstand - prevItem.zaehlerstand;
        if (diff >= 0) {
          calculatedKwh = diff;
        }
      }
      return {
        ...item,
        kwh: calculatedKwh,
      };
    });
    return updated;
  };

  const handleUpdateStromRow = (
    index: number,
    field: 'jahr' | 'kwh' | 'zaehlerstand',
    value: any
  ) => {
    const list = [...strom.verbrauch];
    const parsedVal = value === '' ? undefined : parseNum(value);
    list[index] = { ...list[index], [field]: parsedVal };

    // Wenn Zählerstand oder Jahr geändert wird, automatisch Verbrauch der Folge- und Vorjahre anpassen
    let finalList = list;
    if (field === 'zaehlerstand' || field === 'jahr') {
      finalList = recalculateStromVerbrauch(list);
    }

    onUpdateEnergie({
      ...energie,
      strom: { ...strom, verbrauch: finalList },
    });
  };

  const handleAddStromRow = () => {
    const lastRow = [...strom.verbrauch].sort((a, b) => b.jahr - a.jahr)[0];
    const lastYear = lastRow ? lastRow.jahr : 2025;
    const lastZaehler = lastRow?.zaehlerstand ?? 23015;
    const newRow: StromVerbrauch = {
      jahr: lastYear + 1,
      kwh: 0,
      zaehlerstand: lastZaehler,
    };
    const updatedList = recalculateStromVerbrauch([...strom.verbrauch, newRow]);
    onUpdateEnergie({
      ...energie,
      strom: {
        ...strom,
        verbrauch: updatedList,
      },
    });
  };

  const handleDeleteStromRow = (jahr: number) => {
    const filtered = strom.verbrauch.filter((v) => v.jahr !== jahr);
    const updatedList = recalculateStromVerbrauch(filtered);
    onUpdateEnergie({
      ...energie,
      strom: {
        ...strom,
        verbrauch: updatedList,
      },
    });
  };

  // Gas handlers
  const handleUpdateGasField = (field: string, value: any) => {
    onUpdateEnergie({
      ...energie,
      gas: {
        ...gas,
        [field]: typeof gas[field as keyof typeof gas] === 'number' ? parseNum(value) : value,
      },
    });
  };

  const handleUpdateGasRow = (
    index: number,
    field: 'jahr' | 'wasser' | 'heizung',
    value: any
  ) => {
    const list = [...gas.verbrauch];
    list[index] = { ...list[index], [field]: parseNum(value) };
    onUpdateEnergie({
      ...energie,
      gas: { ...gas, verbrauch: list },
    });
  };

  const handleAddGasRow = () => {
    const lastYear = gas.verbrauch.reduce((max, x) => Math.max(max, x.jahr), 2025);
    onUpdateEnergie({
      ...energie,
      gas: {
        ...gas,
        verbrauch: [...gas.verbrauch, { jahr: lastYear + 1, wasser: 0, heizung: 0 }],
      },
    });
  };

  const handleDeleteGasRow = (jahr: number) => {
    onUpdateEnergie({
      ...energie,
      gas: {
        ...gas,
        verbrauch: gas.verbrauch.filter((v) => v.jahr !== jahr),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Dark-Green Energie Cockpit Header mit interaktiver Umschaltung */}
      <EnergieCockpit
        energie={energie}
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
      />

      {/* Grid container: single or split based on toggle */}
      <div
        className={`grid gap-6 ${
          activeSubTab === 'both' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* STROM CARD */}
        {(activeSubTab === 'both' || activeSubTab === 'strom') && (
          <div
            className="bg-white rounded-2xl border border-[#fed7aa] overflow-hidden shadow-xs"
            style={{ borderTopWidth: '5px', borderTopColor: '#d97706' }}
          >
            {/* Header */}
            <div className="p-4 bg-[#fffbeb] border-b border-[#fef3c7] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706]">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#92400e]">
                    Strom (Elektrik)
                  </h3>
                </div>
              </div>

              {strom.loginUrl && (
                <a
                  href={strom.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200/60 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Anbieter-Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>

            {/* Consumption Chart */}
            <div className="p-4 sm:p-5 border-b border-[#f5f8f6]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5f7069] block">
                      Jahresverbrauch (kWh)
                    </span>
                    {stromChartData.length > 10 && (
                      <span className="text-[10px] text-[#8ea69d] font-normal">
                        (← scrollbar →)
                      </span>
                    )}
                  </div>
                  {avgStrom > 0 && (
                    <span className="text-[11px] text-[#78716c] block">
                      Ø exkl. {currentYear}: <strong className="text-[#14231f]">{avgStrom.toLocaleString('de-DE')} kWh</strong>
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#b45309] font-semibold">
                  Soll: {strom.angegebenerVerbrauch} kWh/Jahr
                </span>
              </div>

              <div className="relative">
                {/* Fixed Sticky Y-Axis on the left */}
                <div className="absolute left-0 top-0 w-12 h-72 bg-white z-20 pointer-events-none border-r border-[#edf2f0]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stromChartData} margin={{ top: 22, right: 0, left: 0, bottom: 5 }}>
                      <YAxis width={45} tick={{ fontSize: 10, fill: '#5f7069' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                      <Bar dataKey="kwh" fill="transparent" />
                      <Bar dataKey="forecastDelta" fill="transparent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full pl-12 overflow-x-auto overflow-y-hidden pb-1">
                  <div
                    className="h-72"
                    style={{
                      width: stromChartData.length > 10 ? `${(stromChartData.length / 10) * 100}%` : '100%',
                      minWidth: '100%',
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stromChartData} margin={{ top: 22, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                        <XAxis dataKey="jahr" tick={{ fontSize: 11, fill: '#5f7069' }} axisLine={false} tickLine={false} />
                        <YAxis hide={true} />
                        <Bar
                          dataKey="kwh"
                          name="Ist-Verbrauch"
                          stackId="stromStack"
                          fill="#d97706"
                          shape={renderIstBar('#d97706')}
                        >
                          <LabelList
                            dataKey="pastKwhDisplay"
                            position="top"
                            fill="#92400e"
                            fontSize={11}
                            fontWeight={700}
                            formatter={(val: any) => (val ? `${Number(val).toLocaleString('de-DE')}` : '')}
                          />
                        </Bar>
                        <Bar
                          dataKey="forecastDelta"
                          name="Prognose Restjahr"
                          stackId="stromStack"
                          fill="#d97706"
                          shape={renderForecastBar('#d97706')}
                        >
                          <LabelList
                            dataKey="currentProjectedDisplay"
                            position="top"
                            fill="#92400e"
                            fontSize={11}
                            fontWeight={700}
                            formatter={(val: any) => (val ? `${Number(val).toLocaleString('de-DE')}` : '')}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Subtile Legende / Hinweis zu 2026 */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#78716c] flex-wrap gap-2 pt-2.5 border-t border-[#f0f4f2]">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-3 rounded-[3px] bg-[#d97706]/35 shrink-0"
                    style={{ border: '1.5px dashed #d97706' }}
                  />
                  <span className="text-[11px] sm:text-xs text-[#5f7069]">
                    <strong className="text-[#14231f]">2026:</strong> Gestrichelter Bereich = Prognose basierend auf bisherigem Jahresverlauf
                  </span>
                </div>
                <span className="text-[11px] text-[#8ea69d] tabular-nums font-medium shrink-0">
                  Tag {daysPassed} von {daysInYear} ({Math.round((daysPassed / daysInYear) * 100)}% vergangen)
                </span>
              </div>
            </div>

            {/* Contract details grid */}
            <div className="p-4 sm:p-5 bg-[#fafcfb] border-b border-[#f0f4f2]">
              <button
                type="button"
                onClick={() => setIsStromVertragCollapsed(!isStromVertragCollapsed)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#5f7069] mb-1 cursor-pointer select-none hover:text-[#14231f]"
              >
                <span>Vertragskonditionen &amp; Tarife</span>
                {isStromVertragCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              {!isStromVertragCollapsed && (
                <div className="space-y-3 text-xs pt-3">
                  {/* Zeile 1: Kundennummer & Zählernummer */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Kundennummer
                      </span>
                      <input
                        type="text"
                        value={strom.kundennummer || ''}
                        onChange={(e) => handleUpdateStromField('kundennummer', e.target.value)}
                        placeholder="z. B. KD-123456"
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Zählernummer
                      </span>
                      <input
                        type="text"
                        value={strom.zaehlernummer}
                        onChange={(e) => handleUpdateStromField('zaehlernummer', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 2: Vertragsbeginn & Vertragslaufzeit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Vertragsbeginn
                      </span>
                      <input
                        type="date"
                        value={strom.vertragsbeginn || ''}
                        onChange={(e) => handleUpdateStromField('vertragsbeginn', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Vertragslaufzeit
                      </span>
                      <input
                        type="date"
                        value={strom.vertragslaufzeit || ''}
                        onChange={(e) => handleUpdateStromField('vertragslaufzeit', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 3: Kündigungsdatum & Preisgarantie */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Kündigungsdatum
                      </span>
                      <input
                        type="date"
                        value={strom.kuendigungsdatum || ''}
                        onChange={(e) => handleUpdateStromField('kuendigungsdatum', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Preisgarantie
                      </span>
                      <input
                        type="date"
                        value={strom.preisGarantie || ''}
                        onChange={(e) => handleUpdateStromField('preisGarantie', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 4: Arbeitspreis, Grundpreis & Abschlag */}
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Arbeitspreis (€/kWh)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="0.0001"
                          value={strom.arbeitspreis}
                          onChange={(e) => handleUpdateStromField('arbeitspreis', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-12 py-1 font-semibold tabular-nums text-[#14231f]"
                        />
                        <span className="absolute right-2 text-[11px] text-gray-500 font-medium pointer-events-none">
                          €/kWh
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Grundpreis (€/Jahr)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="0.01"
                          value={strom.grundpreis}
                          onChange={(e) => handleUpdateStromField('grundpreis', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-12 py-1 font-semibold tabular-nums text-[#14231f]"
                        />
                        <span className="absolute right-2 text-[11px] text-gray-500 font-medium pointer-events-none">
                          €/Jahr
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Abschlag (€/Monat)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="1"
                          value={strom.abschlag}
                          onChange={(e) => handleUpdateStromField('abschlag', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-6 py-1 font-bold tabular-nums text-[#b45309]"
                        />
                        <span className="absolute right-2 text-xs font-bold text-[#b45309] pointer-events-none">
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Zeile 5: Anbieter-Portal Link */}
                  <div>
                    <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                      Anbieter-Portal Link (URL)
                    </span>
                    <input
                      type="text"
                      value={strom.loginUrl || ''}
                      onChange={(e) => handleUpdateStromField('loginUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Historical Table */}
            <div className="p-4 sm:p-5">
              <div className="mb-2">
                <span className="text-xs font-bold text-[#5f7069] uppercase tracking-wider block">
                  Verbrauchshistorie &amp; Zählerstände
                </span>
                <span className="text-[11px] text-[#78716c]">
                  Zählerablesung jeweils zum <strong>01.01.</strong> – Verbrauch (kWh) wird automatisch aus der Differenz zum Vorjahr berechnet
                </span>
              </div>

              {/* Info banner explaining the 01.01. reading */}
              <div className="mb-3 p-2.5 bg-[#fffbeb] border border-[#fed7aa] rounded-xl flex items-center justify-between text-xs text-[#92400e] gap-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#d97706] shrink-0" />
                  <span>
                    <strong>Automatische Berechnung:</strong> Gib einfach den Zählerstand zum <strong>01.01.</strong> des Jahres an. Der Jahresverbrauch errechnet sich automatisch!
                  </span>
                </div>
              </div>

              {/* Jahr hinzufügen Button row under info box */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleAddStromRow}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jahr hinzufügen</span>
                </button>
              </div>

              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden space-y-2.5">
                {[...strom.verbrauch]
                  .sort((a, b) => b.jahr - a.jahr)
                  .map((row) => {
                    const originalIndex = strom.verbrauch.findIndex((v) => v.jahr === row.jahr);
                    return (
                      <div
                        key={row.jahr}
                        className="p-3 bg-[#f8faf9] rounded-xl border border-[#d8e2de] space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-[#e2e8e5] pb-2">
                          <span className="font-extrabold text-sm text-[#14231f]">{row.jahr}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteStromRow(row.jahr)}
                            className="p-1 text-[#9ca3af] hover:text-[#dc2626] rounded hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                            title="Jahr löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-[#5f7069] font-semibold block mb-1">
                              Zählerstand (01.01.)
                            </span>
                            <div className="flex items-center gap-1 bg-white border border-[#d8e2de] rounded-lg px-2 py-1.5 focus-within:border-[#d97706]">
                              <input
                                type="number"
                                placeholder="z.B. 23015"
                                value={row.zaehlerstand ?? ''}
                                onChange={(e) =>
                                  handleUpdateStromRow(originalIndex, 'zaehlerstand', e.target.value)
                                }
                                className="w-full text-right font-semibold tabular-nums text-[#14231f] focus:outline-none"
                              />
                              <span className="text-[10px] text-[#78716c] font-medium shrink-0">
                                kWh
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#5f7069] font-semibold block mb-1">
                              Jahresverbrauch
                            </span>
                            <div className="flex items-center justify-between bg-amber-50/60 border border-amber-200/60 rounded-lg px-2 py-1.5 h-[34px]">
                              <span className="font-extrabold tabular-nums text-[#92400e]">
                                {Number(row.kwh).toLocaleString('de-DE')}
                              </span>
                              <span className="text-[10px] text-[#78716c] font-medium shrink-0">
                                kWh
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#e2e8e5] text-[#5f7069]">
                      <th className="py-2 px-2">Jahr</th>
                      <th className="py-2 px-2 text-right">
                        <div className="flex flex-col items-end">
                          <span>Zählerstand (kWh)</span>
                          <span className="text-[10px] font-normal text-[#8ea69d]">Stand zum 01.01.</span>
                        </div>
                      </th>
                      <th className="py-2 px-2 text-right">
                        <div className="flex flex-col items-end">
                          <span>Jahresverbrauch (kWh)</span>
                          <span className="text-[10px] font-normal text-[#8ea69d]">Auto-Differenz</span>
                        </div>
                      </th>
                      <th className="py-2 px-2 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...strom.verbrauch]
                      .sort((a, b) => b.jahr - a.jahr)
                      .map((row) => {
                        const originalIndex = strom.verbrauch.findIndex((v) => v.jahr === row.jahr);
                        return (
                          <tr key={row.jahr} className="hover:bg-[#fafcfb] border-b border-[#f0f4f2]/60">
                            <td className="py-2 px-2 font-bold tabular-nums text-[#14231f]">
                              <span>{row.jahr}</span>
                            </td>
                            {/* Zählerstand Input */}
                            <td className="py-2 px-1.5 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  placeholder="z.B. 23015"
                                  value={row.zaehlerstand ?? ''}
                                  onChange={(e) =>
                                    handleUpdateStromRow(originalIndex, 'zaehlerstand', e.target.value)
                                  }
                                  className="w-24 text-right bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold tabular-nums text-[#14231f] focus:outline-none focus:border-[#d97706]"
                                />
                                <span className="text-[10px] text-[#78716c] font-medium">
                                  kWh
                                </span>
                              </div>
                            </td>
                            {/* Verbrauch Display (Auto-calculated, non-editable) */}
                            <td className="py-2 px-1.5 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  value={row.kwh}
                                  readOnly
                                  className="w-20 text-right bg-transparent border border-transparent rounded-lg px-1 py-1 font-bold tabular-nums text-[#92400e] cursor-default focus:outline-none"
                                  title="Automatisch aus Zählerständen errechnet"
                                />
                                <span className="text-[10px] text-[#78716c] font-medium">
                                  kWh
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteStromRow(row.jahr)}
                                className="p-1 text-[#9ca3af] hover:text-[#dc2626] rounded hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                                title="Jahr löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GAS CARD */}
        {(activeSubTab === 'both' || activeSubTab === 'gas') && (
          <div
            className="bg-white rounded-2xl border border-[#fecaca] overflow-hidden shadow-xs"
            style={{ borderTopWidth: '5px', borderTopColor: '#dc2626' }}
          >
            {/* Header */}
            <div className="p-4 bg-[#fef2f2] border-b border-[#fee2e2] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-center justify-center text-[#dc2626]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#991b1b]">
                    Gas / Heizung
                  </h3>
                </div>
              </div>

              {gas.loginUrl && (
                <a
                  href={gas.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 border border-slate-200/60 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Anbieter-Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              )}
            </div>

            {/* Consumption Chart (Warmwasser & Heizung getrennt & auswählbar) */}
            <div className="p-4 sm:p-5 border-b border-[#f5f8f6]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5f7069] block">
                      Jahresverbrauch (kWh)
                    </span>
                    {gasChartData.length > 10 && (
                      <span className="text-[10px] text-[#8ea69d] font-normal">
                        (← scrollbar →)
                      </span>
                    )}
                  </div>
                  {avgGas > 0 && (
                    <span className="text-[11px] text-[#78716c] block">
                      Ø exkl. {currentYear}: <strong className="text-[#14231f]">{avgGas.toLocaleString('de-DE')} kWh</strong>
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#dc2626] font-semibold">
                  Soll: {gas.angegebenerVerbrauch} kWh/Jahr
                </span>
              </div>

              <div className="relative">
                {/* Fixed Sticky Y-Axis on the left */}
                <div className="absolute left-0 top-0 w-12 h-72 bg-white z-20 pointer-events-none border-r border-[#edf2f0]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gasChartData} margin={{ top: 22, right: 0, left: 0, bottom: 5 }}>
                      <YAxis width={45} tick={{ fontSize: 10, fill: '#5f7069' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
                      <Bar dataKey="wasser" fill="transparent" />
                      <Bar dataKey="heizung" fill="transparent" />
                      <Bar dataKey="gesamtForecast" fill="transparent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full pl-12 overflow-x-auto overflow-y-hidden pb-1">
                  <div
                    className="h-72"
                    style={{
                      width: gasChartData.length > 10 ? `${(gasChartData.length / 10) * 100}%` : '100%',
                      minWidth: '100%',
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gasChartData} margin={{ top: 22, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                        <XAxis dataKey="jahr" tick={{ fontSize: 11, fill: '#5f7069' }} axisLine={false} tickLine={false} />
                        <YAxis hide={true} />

                        {gasFilter === 'both' ? (
                          <>
                            {/* Unterer Balken-Abschnitt: Warmwasser Ist (Blau) mit Wert im Balken */}
                            <Bar
                              dataKey="wasser"
                              name="Warmwasser (Ist)"
                              stackId="gasStack"
                              fill="#0284c7"
                              shape={renderIstBar('#0284c7')}
                            >
                              <LabelList content={renderWasserInsideLabel} />
                            </Bar>
                            {/* Mittlerer Balken-Abschnitt: Heizung Ist (Rot) mit Wert im Balken */}
                            <Bar
                              dataKey="heizung"
                              name="Heizung (Ist)"
                              stackId="gasStack"
                              fill="#dc2626"
                              shape={renderIstBar('#dc2626')}
                            >
                              <LabelList content={renderHeizungInsideLabel} />
                              {/* Für vergangene Jahre die Gesamtsumme oben anzeigen */}
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                            {/* Oberer Prognose-Abschnitt für das laufende Jahr (gestrichelt/halbtransparent wie bei Strom) mit Gesamtsumme oben */}
                            <Bar
                              dataKey="gesamtForecast"
                              name="Prognose Restjahr"
                              stackId="gasStack"
                              fill="#dc2626"
                              shape={renderForecastBar('#dc2626')}
                            >
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || !row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                          </>
                        ) : gasFilter === 'heizung' ? (
                          <>
                            <Bar
                              dataKey="heizung"
                              name="Heizung (Ist)"
                              stackId="heizungStack"
                              fill="#dc2626"
                              shape={renderIstBar('#dc2626')}
                            >
                              <LabelList content={renderHeizungInsideLabel} />
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                            <Bar
                              dataKey="heizungForecast"
                              name="Heizung (Prognose Restjahr)"
                              stackId="heizungStack"
                              fill="#dc2626"
                              shape={renderForecastBar('#dc2626')}
                            >
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || !row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                          </>
                        ) : (
                          <>
                            <Bar
                              dataKey="wasser"
                              name="Warmwasser (Ist)"
                              stackId="wasserStack"
                              fill="#0284c7"
                              shape={renderIstBar('#0284c7')}
                            >
                              <LabelList content={renderWasserInsideLabel} />
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                            <Bar
                              dataKey="wasserForecast"
                              name="Warmwasser (Prognose Restjahr)"
                              stackId="wasserStack"
                              fill="#0284c7"
                              shape={renderForecastBar('#0284c7')}
                            >
                              <LabelList content={(props: any) => {
                                const row = gasChartData[props.index];
                                if (!row || !row.isCurrentYear) return null;
                                return renderGasTopTotalLabel(props);
                              }} />
                            </Bar>
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Filter-Buttons direkt unter dem Diagramm (unter den Bars) */}
              <div className="mt-3 pt-2.5 border-t border-[#f0f4f2] flex flex-wrap items-center justify-between gap-2.5">
                <div className="w-full flex items-center justify-between gap-1.5 bg-[#fef2f2] p-1 rounded-xl border border-[#fee2e2]">
                  <button
                    type="button"
                    onClick={() => setGasFilter('both')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      gasFilter === 'both'
                        ? 'bg-[#dc2626] text-white shadow-xs'
                        : 'text-[#78716c] hover:text-[#991b1b]'
                    }`}
                  >
                    Beides anzeigen
                  </button>
                  <button
                    type="button"
                    onClick={() => setGasFilter('heizung')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      gasFilter === 'heizung'
                        ? 'bg-[#dc2626] text-white shadow-xs'
                        : 'text-[#78716c] hover:text-[#991b1b]'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Nur Heizung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGasFilter('wasser')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      gasFilter === 'wasser'
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-[#78716c] hover:text-[#0284c7]'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>Nur Warmwasser</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-3 rounded-[3px] bg-[#dc2626]/35 shrink-0"
                    style={{ border: '1.5px dashed #dc2626' }}
                  />
                  <span className="text-[11px] sm:text-xs text-[#5f7069]">
                    <strong className="text-[#14231f]">2026:</strong> Gestrichelter Bereich = Prognose basierend auf bisherigem Jahresverlauf
                  </span>
                </div>
                <span className="text-[11px] text-[#8ea69d] tabular-nums font-medium shrink-0">
                  Tag {daysPassed} von {daysInYear} ({Math.round((daysPassed / daysInYear) * 100)}% vergangen)
                </span>
              </div>
            </div>

            {/* Contract details grid */}
            <div className="p-4 sm:p-5 bg-[#fafcfb] border-b border-[#f0f4f2]">
              <button
                type="button"
                onClick={() => setIsGasVertragCollapsed(!isGasVertragCollapsed)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#5f7069] mb-1 cursor-pointer select-none hover:text-[#14231f]"
              >
                <span>Vertragskonditionen &amp; Tarife</span>
                {isGasVertragCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              {!isGasVertragCollapsed && (
                <div className="space-y-3 text-xs pt-3">
                  {/* Zeile 1: Kundennummer & Zählernummer */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Kundennummer
                      </span>
                      <input
                        type="text"
                        value={gas.kundennummer || ''}
                        onChange={(e) => handleUpdateGasField('kundennummer', e.target.value)}
                        placeholder="z. B. KD-987654"
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Zählernummer
                      </span>
                      <input
                        type="text"
                        value={gas.zaehlernummer}
                        onChange={(e) => handleUpdateGasField('zaehlernummer', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 2: Vertragsbeginn & Vertragslaufzeit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Vertragsbeginn
                      </span>
                      <input
                        type="date"
                        value={gas.vertragsbeginn || ''}
                        onChange={(e) => handleUpdateGasField('vertragsbeginn', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Vertragslaufzeit
                      </span>
                      <input
                        type="date"
                        value={gas.vertragslaufzeit || ''}
                        onChange={(e) => handleUpdateGasField('vertragslaufzeit', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 3: Kündigungsdatum & Preisgarantie */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Kündigungsdatum
                      </span>
                      <input
                        type="date"
                        value={gas.kuendigungsdatum || ''}
                        onChange={(e) => handleUpdateGasField('kuendigungsdatum', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                    <div>
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Preisgarantie
                      </span>
                      <input
                        type="date"
                        value={gas.preisGarantie || ''}
                        onChange={(e) => handleUpdateGasField('preisGarantie', e.target.value)}
                        className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                      />
                    </div>
                  </div>

                  {/* Zeile 4: Arbeitspreis, Grundpreis & Abschlag */}
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Arbeitspreis (€/kWh)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="0.0001"
                          value={gas.arbeitspreis}
                          onChange={(e) => handleUpdateGasField('arbeitspreis', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-12 py-1 font-semibold tabular-nums text-[#14231f]"
                        />
                        <span className="absolute right-2 text-[11px] text-gray-500 font-medium pointer-events-none">
                          €/kWh
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Grundpreis (€/Monat)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="0.01"
                          value={gas.grundpreis}
                          onChange={(e) => handleUpdateGasField('grundpreis', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-14 py-1 font-semibold tabular-nums text-[#14231f]"
                        />
                        <span className="absolute right-2 text-[11px] text-gray-500 font-medium pointer-events-none">
                          €/Monat
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                        Abschlag (€/Monat)
                      </span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="number"
                          step="1"
                          value={gas.abschlag}
                          onChange={(e) => handleUpdateGasField('abschlag', e.target.value)}
                          className="w-full bg-white border border-[#d8e2de] rounded-lg pl-2 pr-6 py-1 font-bold tabular-nums text-[#dc2626]"
                        />
                        <span className="absolute right-2 text-xs font-bold text-[#dc2626] pointer-events-none">
                          €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Zeile 5: Anbieter-Portal Link */}
                  <div>
                    <span className="text-[#8ea69d] block text-[10px] uppercase font-semibold">
                      Anbieter-Portal Link (URL)
                    </span>
                    <input
                      type="text"
                      value={gas.loginUrl || ''}
                      onChange={(e) => handleUpdateGasField('loginUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#d8e2de] rounded-lg px-2 py-1 font-semibold text-[#14231f]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Historical Table */}
            <div className="p-4 sm:p-5">
              <div className="mb-2">
                <span className="text-xs font-bold text-[#5f7069] uppercase tracking-wider block">
                  Verbrauchshistorie (Wasser &amp; Heizung)
                </span>
              </div>
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleAddGasRow}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jahr hinzufügen</span>
                </button>
              </div>
              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden space-y-2.5">
                {[...gas.verbrauch]
                  .sort((a, b) => b.jahr - a.jahr)
                  .map((row) => {
                    const originalIndex = gas.verbrauch.findIndex((v) => v.jahr === row.jahr);
                    const total = row.wasser + row.heizung;
                    return (
                      <div
                        key={row.jahr}
                        className="p-3 bg-[#f8faf9] rounded-xl border border-[#d8e2de] space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-[#e2e8e5] pb-2">
                          <div className="flex items-baseline gap-2">
                            <span className="font-extrabold text-sm text-[#14231f]">{row.jahr}</span>
                            <span className="text-xs font-bold text-[#14231f]">
                              Summe: {total.toLocaleString('de-DE')} kWh
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteGasRow(row.jahr)}
                            className="p-1 text-[#9ca3af] hover:text-[#dc2626] rounded hover:bg-[#fee2e2]/40 transition-colors cursor-pointer"
                            title="Jahr löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-[#5f7069] font-semibold block mb-1">
                              Warmwasser
                            </span>
                            <div className="flex items-center gap-1 bg-white border border-[#d8e2de] rounded-lg px-2 py-1.5 focus-within:border-[#d97706]">
                              <input
                                type="number"
                                value={row.wasser}
                                onChange={(e) =>
                                  handleUpdateGasRow(originalIndex, 'wasser', e.target.value)
                                }
                                className="w-full text-right font-semibold tabular-nums text-[#0284c7] focus:outline-none"
                              />
                              <span className="text-[10px] text-[#78716c] font-medium shrink-0">
                                kWh
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#5f7069] font-semibold block mb-1">
                              Heizung
                            </span>
                            <div className="flex items-center gap-1 bg-white border border-[#d8e2de] rounded-lg px-2 py-1.5 focus-within:border-[#d97706]">
                              <input
                                type="number"
                                value={row.heizung}
                                onChange={(e) =>
                                  handleUpdateGasRow(originalIndex, 'heizung', e.target.value)
                                }
                                className="w-full text-right font-semibold tabular-nums text-[#dc2626] focus:outline-none"
                              />
                              <span className="text-[10px] text-[#78716c] font-medium shrink-0">
                                kWh
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#e2e8e5] text-[#5f7069]">
                      <th className="py-1.5 px-2">Jahr</th>
                      <th className="py-1.5 px-2 text-right">Warmwasser (kWh)</th>
                      <th className="py-1.5 px-2 text-right">Heizung (kWh)</th>
                      <th className="py-1.5 px-2 text-right font-bold">Summe (kWh)</th>
                      <th className="py-1.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...gas.verbrauch]
                      .sort((a, b) => b.jahr - a.jahr)
                      .map((row) => {
                        const originalIndex = gas.verbrauch.findIndex((v) => v.jahr === row.jahr);
                        const total = row.wasser + row.heizung;
                        return (
                          <tr key={row.jahr} className="hover:bg-[#fafcfb]">
                            <td className="py-1.5 px-2 font-bold tabular-nums text-[#14231f]">
                              {row.jahr}
                            </td>
                             <td className="py-1.5 px-1.5 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  value={row.wasser}
                                  onChange={(e) =>
                                    handleUpdateGasRow(originalIndex, 'wasser', e.target.value)
                                  }
                                  className="w-20 text-right bg-white border border-[#d8e2de] rounded-lg px-1.5 py-1 font-semibold tabular-nums text-[#0284c7] focus:outline-none focus:border-[#d97706]"
                                />
                                <span className="text-[10px] text-[#78716c] font-medium">
                                  kWh
                                </span>
                              </div>
                            </td>
                            <td className="py-1.5 px-1.5 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  value={row.heizung}
                                  onChange={(e) =>
                                    handleUpdateGasRow(originalIndex, 'heizung', e.target.value)
                                  }
                                  className="w-20 text-right bg-white border border-[#d8e2de] rounded-lg px-1.5 py-1 font-semibold tabular-nums text-[#dc2626] focus:outline-none focus:border-[#d97706]"
                                />
                                <span className="text-[10px] text-[#78716c] font-medium">
                                  kWh
                                </span>
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold tabular-nums text-[#14231f]">
                              {total.toLocaleString('de-DE')} kWh
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteGasRow(row.jahr)}
                                className="p-1 text-[#9ca3af] hover:text-[#dc2626] cursor-pointer"
                                title="Jahr löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
