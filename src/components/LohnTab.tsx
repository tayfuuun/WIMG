import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { LohnRecord } from '../types';
import { fmt, parseNum, generateId, getCurrencySymbol, fmtNumber } from '../utils/formatters';
import { FormattedAmountInput } from './FormattedAmountInput';
import { GehaltCockpit } from './GehaltCockpit';

interface LohnTabProps {
  lohn: LohnRecord[];
  onUpdateLohn: (lohn: LohnRecord[]) => void;
}

export const LohnTab: React.FC<LohnTabProps> = ({ lohn, onUpdateLohn }) => {
  const currencySymbol = getCurrencySymbol();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sort chronological for calculations
  const chronSorted = [...lohn].sort((a, b) => a.jahr - b.jahr);
  const latestRecord = chronSorted[chronSorted.length - 1];
  const firstRecord = chronSorted[0];

  const totalGrowthPercent =
    firstRecord && latestRecord && firstRecord.netto_monat > 0
      ? ((latestRecord.netto_monat - firstRecord.netto_monat) / firstRecord.netto_monat) * 100
      : 0;

  // Chart data
  const chartData = chronSorted.map((l) => ({
    jahr: l.jahr.toString(),
    netto: Math.round(l.netto_monat),
    brutto: Math.round(l.brutto_jahr),
    ereignis: l.ereignis,
  }));

  const handleUpdate = (id: string, field: keyof LohnRecord, value: any) => {
    onUpdateLohn(
      lohn.map((item) => {
        if (item.id !== id) return item;
        const numericFields: (keyof LohnRecord)[] = ['jahr', 'brutto_jahr', 'netto_monat'];
        return {
          ...item,
          [field]: numericFields.includes(field) ? parseNum(value) : value,
        };
      })
    );
  };

  const handleAddYear = () => {
    const maxYear = chronSorted.reduce((max, x) => Math.max(max, x.jahr), 2025);
    const newRecord: LohnRecord = {
      id: generateId('lohn'),
      jahr: maxYear + 1,
      brutto_jahr: latestRecord ? Math.round(latestRecord.brutto_jahr * 1.03) : 60000,
      netto_monat: latestRecord ? Math.round(latestRecord.netto_monat * 1.03) : 3700,
      ereignis: '-',
    };
    onUpdateLohn([...lohn, newRecord]);
  };

  const handleDelete = (jahr: number, id?: string) => {
    onUpdateLohn(lohn.filter((x) => (id && x.id ? x.id !== id : x.jahr !== jahr)));
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Gehalt Cockpit Hero Card */}
      <GehaltCockpit lohn={lohn} />

      {/* Vermögens- & Netto-Gehaltsentwicklung */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#d8e2de] shadow-xs">
        <div className="pb-4 border-b border-[#eef2f0]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-lg sm:text-xl text-[#14231f]">
              Gehaltsentwicklung
            </h3>
          </div>
          <div className="mt-2 text-xs sm:text-sm font-semibold text-[#14231f]">
            <span className="text-[#5f7069] uppercase font-bold text-[11px] block">Wachstum:</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm font-extrabold text-[#14532d]">
                {fmt(firstRecord?.netto_monat)} → {fmt(latestRecord?.netto_monat)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#14532d] text-white font-bold text-xs">
                +{totalGrowthPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Smooth Area Chart with High-Contrast Tooltip */}
        <div className="w-full mt-4">
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="lohnNettoGradScreen3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" vertical={false} />
                <XAxis dataKey="jahr" stroke="#8ea69d" fontSize={11} tickLine={false} />
                <YAxis
                  width={65}
                  stroke="#8ea69d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${fmtNumber(val, 0)} ${currencySymbol}`}
                />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0];
                  const data = item.payload;
                  return (
                    <div className="bg-[#14231f] text-white border border-[#2b473d] rounded-2xl p-3.5 shadow-xl min-w-[180px]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9eb8af]">
                        Jahr: {label}
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-white mt-1 tabular-nums">
                        {fmt(Number(item.value))}{' '}
                        <span className="text-xs font-normal text-[#9eb8af]">/ Monat</span>
                      </div>
                      {data.ereignis && data.ereignis !== '-' && (
                        <div className="mt-2 pt-2 border-t border-[#233d34] flex items-center gap-1.5 text-xs">
                          <span className="text-[#a7f3d0] font-semibold">Ereignis:</span>
                          <span className="text-white font-medium bg-[#1d352b] px-2 py-0.5 rounded-md border border-[#2d5445]">
                            {data.ereignis}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="netto"
                stroke="#0f766e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#lohnNettoGradScreen3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>

      {/* Salary History Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="pb-4 mb-4 border-b border-slate-100 space-y-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
            Jahresübersicht
          </h3>
          <div>
            <button
              type="button"
              onClick={handleAddYear}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl px-3.5 py-2 shadow-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Jahr hinzufügen</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {[...lohn]
            .sort((a, b) => b.jahr - a.jahr)
            .map((record) => {
              const chronIndex = chronSorted.findIndex((x) => x.jahr === record.jahr);
              const prevNetto =
                chronIndex > 0 ? chronSorted[chronIndex - 1].netto_monat : record.netto_monat;
              const diffPercent =
                prevNetto > 0
                  ? ((record.netto_monat - prevNetto) / prevNetto) * 100
                  : 0;

              return (
                <div
                  key={record.id || `lohn-${record.jahr}`}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all space-y-3.5"
                >
                  {/* Card Header (Obere Zeile) */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    {/* Links: Jahr als Pill / Badge Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={record.jahr}
                        onChange={(e) => handleUpdate(record.id, 'jahr', e.target.value)}
                        className="w-20 sm:w-24 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-[#0f766e] rounded-xl px-2.5 py-1 text-sm font-extrabold tabular-nums text-slate-800 text-center transition-colors focus:outline-none"
                      />
                    </div>

                    {/* Rechts: Wachstums/Prozent-Badge + Trash Icon ohne Text */}
                    <div className="flex items-center gap-2.5">
                      {chronIndex === 0 ? (
                        <span className="text-slate-500 text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                          Basis
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            diffPercent >= 0
                              ? 'bg-[#dcfce7] text-[#15803d] border border-[#86efac]'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {diffPercent >= 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#15803d]" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                          )}
                          {diffPercent >= 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`}
                        </span>
                      )}

                      {/* Trash Icon ohne Text */}
                      <button
                        type="button"
                        onClick={() => handleDelete(record.jahr, record.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eintrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Felder-Layout (Netto Monat & Brutto Jahr) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Netto (Monat) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                        Netto (Monat)
                      </label>
                      <FormattedAmountInput
                        value={record.netto_monat}
                        onChange={(val) => handleUpdate(record.id, 'netto_monat', val)}
                        className="w-full px-3 py-2 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 focus:border-[#0f766e] rounded-xl text-xs sm:text-sm font-medium text-slate-800 text-right transition-colors focus:outline-none"
                        decimals={2}
                        showCurrencySymbol={true}
                      />
                    </div>

                    {/* Brutto (Jahr) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                        Brutto (Jahr)
                      </label>
                      <FormattedAmountInput
                        value={record.brutto_jahr}
                        onChange={(val) => handleUpdate(record.id, 'brutto_jahr', val)}
                        className="w-full px-3 py-2 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 focus:border-[#0f766e] rounded-xl text-xs sm:text-sm font-medium text-slate-800 text-right transition-colors focus:outline-none"
                        decimals={2}
                        showCurrencySymbol={true}
                      />
                    </div>
                  </div>

                  {/* Notiz / Bemerkung Feld */}
                  <div className="flex flex-col gap-1 pt-0.5">
                    <input
                      type="text"
                      value={record.ereignis || ''}
                      onChange={(e) => handleUpdate(record.id, 'ereignis', e.target.value)}
                      className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-300 focus:border-[#0f766e] rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors"
                      placeholder="Notiz / Bemerkung..."
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
