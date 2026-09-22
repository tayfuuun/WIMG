import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  Coins,
  LineChart,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  Info,
} from 'lucide-react';
import { PortfolioAsset, AssetKategorie } from '../types';
import { fmt, parseNum } from '../utils/formatters';
import { PortfolioCharts } from './PortfolioCharts';
import { PortfolioCockpit } from './PortfolioCockpit';
import { updateAssetPrices } from '../utils/priceFetcher';

interface PortfolioTabProps {
  assets: PortfolioAsset[];
  onUpdateAssets: (assets: PortfolioAsset[]) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  assets = [],
  onUpdateAssets,
}) => {
  const [filterCat, setFilterCat] = useState<'all' | AssetKategorie>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formKategorie, setFormKategorie] = useState<AssetKategorie>('aktie');
  const [formKennung, setFormKennung] = useState('');
  const [formAnteile, setFormAnteile] = useState<string>('');
  const [formKaufpreis, setFormKaufpreis] = useState<string>('');
  const [formKursAktuell, setFormKursAktuell] = useState<string>('');
  const [formNotizen, setFormNotizen] = useState('');
  const [formAutoUpdate, setFormAutoUpdate] = useState(false);

  const activeAssets = assets.filter((a) => a.active !== false);

  const categoryAssets = activeAssets.filter((asset) => {
    return filterCat === 'all' || asset.kategorie === filterCat;
  });

  // Auto-fetch live market quotes (Binance, Yahoo Finance, Finanten)
  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      const updated = await updateAssetPrices(assets);
      onUpdateAssets(updated);
      setUpdateMessage('Live-Kurse erfolgreich aktualisiert!');
      setTimeout(() => setUpdateMessage(null), 3500);
    } catch (e) {
      console.error(e);
      setUpdateMessage('Fehler beim Abrufen der Live-Kurse');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoryChange = (cat: AssetKategorie) => {
    setFormKategorie(cat);
    if (cat === 'guthaben') {
      setFormAnteile('5000');
      setFormKaufpreis('1');
      setFormKursAktuell('1');
      if (!formName) setFormName('Notgroschen (Tagesgeld)');
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormKategorie('aktie');
    setFormKennung('');
    setFormAnteile('');
    setFormKaufpreis('');
    setFormKursAktuell('');
    setFormNotizen('');
    setFormAutoUpdate(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: PortfolioAsset) => {
    setEditingId(asset.id);
    setFormName(asset.name);
    setFormKategorie(asset.kategorie);
    setFormKennung(asset.kennung || '');
    setFormAnteile(asset.anteile.toString());
    setFormKaufpreis(asset.kaufpreisDurchschnitt.toString());
    setFormKursAktuell(asset.kursAktuell.toString());
    setFormNotizen(asset.notizen || '');
    setFormAutoUpdate(asset.autoUpdate || false);
    setIsModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const anteileNum = parseNum(formAnteile);
    const kaufNum = parseNum(formKaufpreis);
    const kursNum = parseNum(formKursAktuell) || kaufNum;

    if (editingId) {
      const updated = assets.map((a) => (a.id === editingId ? {
        ...a,
        name: formName.trim(),
        kategorie: formKategorie,
        kennung: formKennung.trim().toUpperCase(),
        anteile: anteileNum,
        kaufpreisDurchschnitt: kaufNum,
        kursAktuell: kursNum,
        notizen: formNotizen.trim(),
        autoUpdate: formAutoUpdate,
        letztesUpdate: new Date().toISOString(),
      } : a));
      onUpdateAssets(updated);
    } else {
      const newAsset: PortfolioAsset = {
        id: 'asset-' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        kategorie: formKategorie,
        kennung: formKennung.trim().toUpperCase(),
        anteile: anteileNum,
        kaufpreisDurchschnitt: kaufNum,
        kursAktuell: kursNum,
        notizen: formNotizen.trim(),
        autoUpdate: formAutoUpdate,
        active: true,
        letztesUpdate: new Date().toISOString(),
      };
      onUpdateAssets([...assets, newAsset]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteAsset = (id: string) => {
    onUpdateAssets(assets.filter((a) => a.id !== id));
  };

  const filteredAssets = categoryAssets.filter((asset) => {
    const matchesQuery = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.kennung && asset.kennung.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Dark Green Portfolio Cockpit */}
      <PortfolioCockpit
        portfolio={assets}
        onRefreshPrices={handleUpdatePrices}
      />

      {updateMessage && (
        <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{updateMessage}</span>
        </div>
      )}

      {/* Interactive Charts Section */}
      <PortfolioCharts
        assets={assets}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#d8e2de]">
        {/* Zeile 1: Kategorien in 1 Zeile (ohne "Alle", Toggle-Filterung) */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          <button
            onClick={() => setFilterCat((prev) => (prev === 'aktie' ? 'all' : 'aktie'))}
            className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              filterCat === 'aktie'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f]'
            }`}
            title="Aktien"
          >
            Aktien
          </button>
          <button
            onClick={() => setFilterCat((prev) => (prev === 'etf' ? 'all' : 'etf'))}
            className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              filterCat === 'etf'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f]'
            }`}
            title="ETFs"
          >
            ETFs
          </button>
          <button
            onClick={() => setFilterCat((prev) => (prev === 'krypto' ? 'all' : 'krypto'))}
            className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              filterCat === 'krypto'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f]'
            }`}
            title="Krypto"
          >
            Krypto
          </button>
          <button
            onClick={() => setFilterCat((prev) => (prev === 'guthaben' ? 'all' : 'guthaben'))}
            className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate ${
              filterCat === 'guthaben'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f]'
            }`}
            title="Guthaben"
          >
            Guthaben
          </button>
        </div>

        {/* Zeile 2: Suchfenster */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8ea69d]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Asset suchen..."
            className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl pl-9 pr-3 py-2 text-xs text-[#14231f] placeholder-[#8ea69d] focus:outline-none focus:border-[#0f766e] focus:bg-white transition-all"
          />
        </div>

        {/* Zeile 3: Neues Asset Button */}
        <div>
          <button
            onClick={handleOpenAddModal}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Asset</span>
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#d8e2de] text-center space-y-3">
          <Coins className="w-10 h-10 text-[#8ea69d] mx-auto" />
          <h3 className="text-base font-bold text-[#14231f]">Keine Assets gefunden</h3>
          <p className="text-xs text-[#5f7069] max-w-sm mx-auto">
            Es wurden keine Assets gefunden, die den Filterkriterien entsprechen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const wertAktuell = asset.anteile * asset.kursAktuell;
            const wertInvestiert = asset.anteile * asset.kaufpreisDurchschnitt;
            const gewinnAbs = wertAktuell - wertInvestiert;
            const gewinnPct = wertInvestiert > 0 ? (gewinnAbs / wertInvestiert) * 100 : 0;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-[#d8e2de] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-4 border-b border-[#edf2ef] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold text-[#14231f] truncate">{asset.name}</span>
                    {asset.kennung && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#f0f4f2] text-[#0f766e] border border-slate-200/80 shrink-0">
                        {asset.kennung}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(asset)}
                      title="Bearbeiten"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f766e] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(asset.id)}
                      title="Löschen"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-4 space-y-3.5">
                  {/* Aktueller Wert & Performance */}
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#5f7069] uppercase tracking-wider block">
                      Aktueller Wert
                    </span>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="text-lg sm:text-xl font-black text-[#14231f] tabular-nums">
                        {fmt(wertAktuell)}
                      </span>
                      <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${
                        gewinnAbs >= 0 ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fef2f2] text-[#dc2626]'
                      }`}>
                        {gewinnAbs >= 0 ? <TrendingUp className="w-3.5 h-3.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
                        <span className="whitespace-nowrap">{gewinnAbs >= 0 ? '+' : ''}{fmt(gewinnAbs)} ({gewinnPct >= 0 ? '+' : ''}{gewinnPct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  {asset.kategorie === 'guthaben' ? (
                    <div className="bg-[#f8faf9] p-2.5 rounded-xl border border-[#e8edea] text-center">
                      <span className="text-[10px] text-[#5f7069] font-medium block">Verfügbares Guthaben / Notgroschen</span>
                      <span className="text-xs sm:text-sm font-bold text-[#14231f] tabular-nums">{fmt(asset.anteile)}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-[#f8faf9] p-2 sm:p-2.5 rounded-xl border border-[#e8edea] text-center">
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] text-[#5f7069] font-medium block truncate">Anteile</span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#14231f] tabular-nums truncate block">{asset.anteile}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] text-[#5f7069] font-medium block truncate">Ø Kaufkurs</span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#14231f] tabular-nums truncate block">{fmt(asset.kaufpreisDurchschnitt)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] text-[#5f7069] font-medium block truncate">Akt. Kurs</span>
                        <span className="text-[11px] sm:text-xs font-bold text-[#14231f] tabular-nums truncate block">{fmt(asset.kursAktuell)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-[#f8faf9] border-t border-[#edf2ef] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#8ea69d] text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{asset.letztesUpdate ? new Date(asset.letztesUpdate).toLocaleDateString() : 'Nie'}</span>
                    {asset.autoUpdate && <span className="text-[#0f766e] font-bold ml-1" title="Automatisches tägliches Update aktiv">(Auto)</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Asset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white sm:bg-black/65 sm:backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-full sm:max-w-2xl h-full sm:h-auto max-h-full sm:max-h-[90vh] p-5 sm:p-6 shadow-2xl border-0 sm:border border-[#d8e2de] space-y-5 flex flex-col overflow-y-auto animate-in fade-in sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#edf2ef] pb-4 shrink-0">
              <h3 className="text-lg font-black text-[#14231f]">
                {editingId ? 'Asset bearbeiten' : 'Neues Asset hinzufügen'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#5f7069] hover:bg-[#f0f4f2] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="z.B. Apple Inc. oder MSCI World ETF"
                  className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1">
                    Kategorie
                  </label>
                  <select
                    value={formKategorie}
                    onChange={(e) => handleCategoryChange(e.target.value as AssetKategorie)}
                    className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                  >
                    <option value="aktie">Aktie</option>
                    <option value="etf">ETF</option>
                    <option value="krypto">Krypto</option>
                    <option value="guthaben">Guthaben / Notgroschen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1 whitespace-nowrap">
                    ISIN / Ticker (optional)
                  </label>
                  <input
                    type="text"
                    value={formKennung}
                    onChange={(e) => setFormKennung(e.target.value)}
                    placeholder="z.B. US0378331005 oder AAPL"
                    className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                  />
                </div>
              </div>

              {/* ISIN Hint Box */}
              {formKategorie !== 'guthaben' && (
                <div className="text-[11px] text-[#0f766e] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-2.5 font-medium flex items-center gap-2 leading-snug">
                  <Info className="w-4 h-4 shrink-0 text-[#16a34a]" />
                  <span>
                    Mit der <strong>ISIN</strong> (z.&nbsp;B. <i>US0378331005</i>) wird der Kurs automatisch live abgerufen.
                  </span>
                </div>
              )}

              {formKategorie === 'guthaben' ? (
                <div>
                  <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1">
                    Gesamtbetrag (€) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAnteile}
                    onChange={(e) => {
                      setFormAnteile(e.target.value);
                      setFormKaufpreis('1');
                      setFormKursAktuell('1');
                    }}
                    placeholder="z.B. 15000"
                    className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                  />
                  <p className="mt-1 text-[11px] text-[#5f7069]">
                    Fester Guthabenbetrag (z.B. Notgroschen, Tagesgeld, Girokonto).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1 whitespace-nowrap">
                      Anteile *
                    </label>
                    <input
                      type="text"
                      required
                      value={formAnteile}
                      onChange={(e) => setFormAnteile(e.target.value)}
                      placeholder="z.B. 10.5"
                      className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1 whitespace-nowrap">
                      Ø Kaufkurs *
                    </label>
                    <input
                      type="text"
                      required
                      value={formKaufpreis}
                      onChange={(e) => setFormKaufpreis(e.target.value)}
                      placeholder="z.B. 150.00"
                      className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1 whitespace-nowrap">
                      Akt. Kurs *
                    </label>
                    <input
                      type="text"
                      required
                      value={formKursAktuell}
                      onChange={(e) => setFormKursAktuell(e.target.value)}
                      placeholder="z.B. 175.50"
                      className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5f7069] uppercase tracking-wider mb-1">
                  Notizen / Depotbank
                </label>
                <textarea
                  value={formNotizen}
                  onChange={(e) => setFormNotizen(e.target.value)}
                  rows={2}
                  placeholder="z.B. Depot bei Trade Republic"
                  className="w-full bg-[#f8faf9] border border-[#d8e2de] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoUpdateCheck"
                  checked={formAutoUpdate}
                  onChange={(e) => setFormAutoUpdate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0f766e] focus:ring-[#0f766e]"
                />
                <label htmlFor="autoUpdateCheck" className="text-xs font-semibold text-[#14231f] cursor-pointer">
                  Automatische Kursaktualisierung aktivieren
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf2ef]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f] text-xs font-bold transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0f766e] hover:bg-[#115e59] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
