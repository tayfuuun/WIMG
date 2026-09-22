import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { PortfolioAsset } from '../types';
import { fmt, fmtNumber } from '../utils/formatters';

interface PortfolioChartsProps {
  assets: PortfolioAsset[];
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  assets = [],
}) => {
  const activeAssets = assets.filter((a) => a.active !== false);

  if (activeAssets.length === 0) {
    return null;
  }

  // Aggregate by category
  const categoryMap: Record<string, { name: string; wert: number; investiert: number }> = {
    aktie: { name: 'Aktien', wert: 0, investiert: 0 },
    etf: { name: 'ETFs', wert: 0, investiert: 0 },
    krypto: { name: 'Krypto', wert: 0, investiert: 0 },
    guthaben: { name: 'Guthaben', wert: 0, investiert: 0 },
  };

  activeAssets.forEach((asset) => {
    const cat = asset.kategorie || 'aktie';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, wert: 0, investiert: 0 };
    }
    categoryMap[cat].wert += asset.anteile * asset.kursAktuell;
    categoryMap[cat].investiert += asset.anteile * asset.kaufpreisDurchschnitt;
  });

  const categoryData = Object.values(categoryMap).filter((d) => d.wert > 0);

  // Top performers
  const assetPerformance = activeAssets
    .filter((a) => a.kategorie !== 'guthaben')
    .map((a) => {
    const wert = a.anteile * a.kursAktuell;
    const inv = a.anteile * a.kaufpreisDurchschnitt;
    const g = wert - inv;
    const pct = inv > 0 ? (g / inv) * 100 : 0;
    return {
      name: a.name,
      gewinn: g,
      prozent: pct,
    };
  }).sort((a, b) => b.gewinn - a.gewinn);

  const COLORS = ['#0f766e', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation Pie / Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#d8e2de] shadow-xs flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-black text-[#14231f]">Vermögensverteilung</h3>
          <p className="text-xs text-[#5f7069]">Aufteilung nach Asset-Klassen</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="wert"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={4}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${fmt(Number(value))}`, 'Wert']}
                contentStyle={{ background: '#14231f', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#d8e2de] shadow-xs flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-base font-black text-[#14231f]">Performance nach Asset</h3>
          <p className="text-xs text-[#5f7069]">Absoluter Gewinn oder Verlust in €</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={assetPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" tickFormatter={(v) => `${v >= 0 ? '+' : ''}${fmtNumber(v, 0)} €`} stroke="#8ea69d" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#8ea69d" fontSize={11} width={80} />
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${Number(value) >= 0 ? '+ ' : ''}${fmt(Number(value))} (${item.payload.prozent.toFixed(1)}%)`,
                  'Gewinn/Verlust',
                ]}
                contentStyle={{ background: '#14231f', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="gewinn" radius={[0, 6, 6, 0]}>
                {assetPerformance.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.gewinn >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
