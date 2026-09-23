import React, { useState, useEffect, useRef } from 'react';
import { initialData, initialNotfallKonten } from './data/initialData';
import { DashboardData, TabKey, FixCategory, IncomeGroup, Kredit, EnergieData, LohnRecord, KontoRecord, NotfallKonto } from './types';
import { monthly, parseNum } from './utils/formatters';
import { calculateCurrentRestDebt, simulateLoanAmortization } from './utils/creditCalculator';
import { Sidebar } from './components/Sidebar';
import { TopNavigation } from './components/TopNavigation';
import { TopBar } from './components/TopBar';
import { CockpitTab } from './components/CockpitTab';
import { FinanzenTab } from './components/FinanzenTab';
import { KrediteTab } from './components/KrediteTab';
import { EnergieTab } from './components/EnergieTab';
import { LohnTab } from './components/LohnTab';
import { KontenTab } from './components/KontenTab';
import { PortfolioTab } from './components/PortfolioTab';
import { NavSettingsModal } from './components/NavSettingsModal';
import { useOrientation } from './hooks/useOrientation';

const STORAGE_KEY = 'finanz-dashboard-v17';

export const DEFAULT_VISIBLE_TABS: Record<TabKey, boolean> = {
  cockpit: true,
  finanzen: true,
  kredite: true,
  energie: true,
  lohn: true,
  konten: true,
  fix: false,
  portfolio: true,
};

export default function App() {
  const [data, setData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean and migrate legacy business groups if present
        let categories = parsed.fix?.categories || initialData.fix.categories;
        if (parsed.income?.expenseGroups && parsed.income.expenseGroups.length > 0) {
          // If former business expense groups exist, merge them as categories if not already there
          parsed.income.expenseGroups.forEach((eg: any) => {
            if (!categories.some((c: any) => c.name.toLowerCase() === eg.name.toLowerCase() || c.id === eg.id)) {
              categories = [
                ...categories,
                {
                  id: eg.id || 'cat-migrated-' + Math.random().toString(36).substring(2, 6),
                  name: eg.name.replace('Ausgaben - ', '').replace(' Fix', ''),
                  color: eg.color || '#e11d48',
                  collapsed: false,
                  active: eg.active !== false,
                  type: 'expense',
                  items: eg.items || [],
                },
              ];
            }
          });
        }

        // Ensure all kredite have active, calculation fields and up-to-date restbetrag
        const existingKredite = parsed.kredite || initialData.kredite;
        const kredite = existingKredite.map((k: Kredit) => {
          const initMatch = initialData.kredite.find((ik) => ik.id === k.id || ik.bemerkung === k.bemerkung);
          const enriched: Kredit = {
            ...k,
            active: k.active !== false,
            kategorie: k.kategorie || initMatch?.kategorie,
            tilgungsart: k.tilgungsart !== undefined ? k.tilgungsart : initMatch?.tilgungsart,
            isBausparer: k.isBausparer !== undefined ? k.isBausparer : initMatch?.isBausparer,
            name: k.name || initMatch?.name,
            bank: k.bank || initMatch?.bank,
            notizen: k.notizen || initMatch?.notizen,
            rate_monat: k.rate_monat !== undefined ? k.rate_monat : (initMatch?.rate_monat || 0),
            laufzeitJahre: k.laufzeitJahre !== undefined ? k.laufzeitJahre : initMatch?.laufzeitJahre,
            tilgung: k.tilgung !== undefined ? k.tilgung : initMatch?.tilgung,
            startMonat: k.startMonat !== undefined ? k.startMonat : initMatch?.startMonat,
            startJahr: k.startJahr !== undefined ? k.startJahr : initMatch?.startJahr,
            lastUpdateMonat: k.lastUpdateMonat || k.startMonat || (new Date().getMonth() + 1),
            lastUpdateJahr: k.lastUpdateJahr || k.startJahr || new Date().getFullYear(),
          };
          // Preserve manually entered restbetrag if available; otherwise calculate
          if (enriched.restbetrag === undefined || enriched.restbetrag === null) {
            if (enriched.startJahr && enriched.startMonat) {
              enriched.restbetrag = calculateCurrentRestDebt(enriched);
            } else {
              enriched.restbetrag = enriched.betrag;
            }
          }
          return enriched;
        });

        // Add any new initial loans if they are not in the existing array
        initialData.kredite.forEach((initK) => {
          if (!kredite.some((k: Kredit) => k.id === initK.id || k.bemerkung === initK.bemerkung)) {
            kredite.push({ ...initK });
          }
        });

        // Ensure portfolio assets use current market baseline if they were using old default prices
        const rawPortfolio = parsed.portfolio || initialData.portfolio;
        const portfolio = rawPortfolio.map((p: any) => {
          const normKennung = (p.kennung || '').trim().toUpperCase();
          const normName = (p.name || '').trim().toUpperCase();

          if (normKennung === 'BTC' && (p.kursAktuell === 60000 || p.kursAktuell === 50000 || !p.kursAktuell)) {
            return { ...p, kursAktuell: 74476.88 };
          }
          if ((normKennung === 'US0378331005' || normName.includes('APPLE')) && (p.kursAktuell === 200 || !p.kursAktuell)) {
            return { ...p, kursAktuell: 295.40 };
          }
          // Alphabet A (Screen 1: 307.18 €)
          if ((normKennung === 'US02079K3059' || normKennung === 'GOOGL' || normName.includes('ALPHABET')) && (p.kursAktuell === 310.39 || !p.kursAktuell)) {
            return { ...p, kursAktuell: 307.18 };
          }
          // NVIDIA (Screen 2: 199.65 €)
          if ((normKennung === 'US67066G1040' || normKennung === 'NVDA' || normName.includes('NVIDIA')) && (p.kursAktuell === 195.11 || !p.kursAktuell)) {
            return { ...p, kursAktuell: 199.65 };
          }
          // Nasdaq 100 (Screen 3: 1544.40 €)
          if ((normKennung === 'IE00B53SZB19' || normKennung === 'SXRV' || normName.includes('NASDAQ')) && (p.kursAktuell === 1502.20 || !p.kursAktuell)) {
            return { ...p, kursAktuell: 1544.40 };
          }
          return p;
        });

        return {
          ...initialData,
          ...parsed,
          notfallKonten: parsed.notfallKonten || initialData.notfallKonten || initialNotfallKonten,
          portfolio,
          fix: {
            categories,
          },
          income: {
            groups: parsed.income?.groups || initialData.income.groups,
            expenseGroups: [],
          },
          kredite,
          energie: {
            ...initialData.energie,
            ...(parsed.energie || {}),
            strom: {
              ...initialData.energie.strom,
              ...(parsed.energie?.strom || {}),
              verbrauch: (parsed.energie?.strom?.verbrauch || initialData.energie.strom.verbrauch).map((v: any) => {
                const initMatch = initialData.energie.strom.verbrauch.find((iv) => iv.jahr === v.jahr);
                return {
                  ...v,
                  zaehlerstand: v.zaehlerstand !== undefined ? v.zaehlerstand : initMatch?.zaehlerstand,
                };
              }),
            },
          },
          visibleTabs: {
            ...DEFAULT_VISIBLE_TABS,
            ...(parsed.visibleTabs || {}),
          },
          language: parsed.language || 'de',
        };
      }
    } catch (e) {
      console.warn('Could not read stored dashboard data, using defaults.', e);
    }
    return initialData;
  });



  const [activeTab, setActiveTab] = useState<TabKey>('cockpit');
  const [kreditCategoryFilter, setKreditCategoryFilter] = useState<'all' | 'ratenkredit' | 'immobilie'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialMount = useRef(true);
  const [isNavSettingsOpen, setIsNavSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isPortrait, deviceIsPortrait, forcedMode, setForcedMode } = useOrientation();

  // Active visible tabs map
  const visibleTabs: Record<TabKey, boolean> = {
    ...DEFAULT_VISIBLE_TABS,
    ...(data.visibleTabs || {}),
  };

  // Fallback: If current active tab is disabled, switch to the first enabled tab
  useEffect(() => {
    if (!visibleTabs[activeTab]) {
      const firstActive = (Object.keys(visibleTabs) as TabKey[]).find((k) => visibleTabs[k]);
      if (firstActive) {
        setActiveTab(firstActive);
      }
    }
  }, [visibleTabs, activeTab]);

  // Persistence to localStorage (all data including hidden tabs are preserved)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSavedAt(new Date());
      if (isInitialMount.current) {
        isInitialMount.current = false;
      } else {
        setHasUnsavedChanges(true);
      }
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [data]);

  // Global KPI calculations (Business is completely integrated into categories & income groups)
  const totalFixExpenses = data.fix.categories
    .filter((c) => c.active !== false)
    .reduce(
      (sum, cat) =>
        sum +
        cat.items
          .filter((it) => it.active !== false)
          .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
      0
    );

  const totalIncome = data.income.groups
    .filter((g) => g.active !== false)
    .reduce(
      (sum, grp) =>
        sum +
        grp.items
          .filter((it) => it.active !== false)
          .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
      0
    );

  const netSavings = totalIncome - totalFixExpenses;

  // Selected Kredite KPI calculations dynamically filtered by category filter
  const filteredKredite = (data.kredite || []).filter((k) => {
    if (kreditCategoryFilter === 'ratenkredit' || kreditCategoryFilter === 'konsum') {
      const cat = k.kategorie || 'ratenkredit';
      return cat === 'ratenkredit' || cat === 'konsum';
    }
    if (kreditCategoryFilter === 'immobilie') {
      return k.kategorie === 'immobilie';
    }
    return true;
  });

  const activeFilteredKredite = filteredKredite.filter((k) => k.active !== false);
  const kreditMonthlyRate = activeFilteredKredite.reduce((sum, k) => sum + parseNum(k.rate_monat || 0), 0);
  
  // Echte Kredite (Schulden) vs. Bausparer (Guthaben) trennen
  const activeDebtKredite = activeFilteredKredite.filter((k) => !k.isBausparer);
  const activeBausparKredite = activeFilteredKredite.filter((k) => !!k.isBausparer);
  
  const kreditRestDebt = activeDebtKredite.reduce((sum, k) => sum + parseNum(k.restbetrag || 0), 0);
  const kreditBausparGuthaben = activeBausparKredite.reduce((sum, k) => sum + parseNum(k.restbetrag || 0), 0);
  const kreditTotalOriginal = activeDebtKredite.reduce((sum, k) => sum + parseNum(k.gesamtbetrag || 0), 0);
  const kreditPaidDebt = Math.max(0, kreditTotalOriginal - kreditRestDebt);
  const kreditPaidPercent = kreditTotalOriginal > 0 ? (kreditPaidDebt / kreditTotalOriginal) * 100 : 0;
  const kreditActiveCount = activeFilteredKredite.length;
  const kreditTotalCount = filteredKredite.length;
  const kreditDebtSim = simulateLoanAmortization(activeFilteredKredite, 0);

  // Backup handlers
  const handleExport = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanz-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setHasUnsavedChanges(false);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!imported || typeof imported !== 'object') {
          throw new Error('Ungültiges Dateiformat');
        }
        setData((prev) => ({
          ...prev,
          ...imported,
          visibleTabs: {
            ...DEFAULT_VISIBLE_TABS,
            ...(imported.visibleTabs || {}),
          },
        }));
        setHasUnsavedChanges(false);
        alert('Erfolgreich importiert!');
      } catch (err: any) {
        alert('Fehler beim Importieren der Datei: ' + (err.message || 'Ungültiges JSON'));
      }
    };
    reader.readAsText(file);
  };

  // Toggle navigation tab visibility (keeps underlying data 100% intact!)
  const handleToggleTab = (tabKey: TabKey) => {
    const current = { ...DEFAULT_VISIBLE_TABS, ...(data.visibleTabs || {}) };
    const activeCount = Object.values(current).filter(Boolean).length;

    // Prevent disabling the very last visible tab
    if (current[tabKey] && activeCount <= 1) {
      return;
    }

    const nextVal = !current[tabKey];
    const updatedVisibleTabs = {
      ...current,
      [tabKey]: nextVal,
    };

    setData((prev) => ({
      ...prev,
      visibleTabs: updatedVisibleTabs,
    }));

    // If the currently active tab was just hidden, navigate to first remaining tab
    if (!nextVal && activeTab === tabKey) {
      const nextActive = (Object.keys(updatedVisibleTabs) as TabKey[]).find(
        (k) => updatedVisibleTabs[k]
      );
      if (nextActive) {
        setActiveTab(nextActive);
      }
    }
  };

  const handleResetVisibleTabs = () => {
    setData((prev) => ({
      ...prev,
      visibleTabs: { ...DEFAULT_VISIBLE_TABS },
    }));
  };

  // Navigate to tab, ensuring it is unhidden if currently turned off
  const handleNavigate = (tab: TabKey) => {
    const current = { ...DEFAULT_VISIBLE_TABS, ...(data.visibleTabs || {}) };
    if (!current[tab]) {
      setData((prev) => ({
        ...prev,
        visibleTabs: {
          ...current,
          [tab]: true,
        },
      }));
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`flex ${
        isPortrait ? 'flex-col' : 'flex-row'
      } h-screen w-screen overflow-hidden bg-[#f4f6f4] text-[#14231f]`}
    >
      {/* Hidden File Input for JSON Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/json"
        className="hidden"
      />

      {/* Navigation: Top Navigation when in Portrait (Hochkant), Sidebar when in Landscape (Querformat) */}
      <div className={`print:hidden ${isPortrait ? 'w-full shrink-0' : 'h-full shrink-0 flex'}`}>
        {isPortrait ? (
          <TopNavigation
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onExport={handleExport}
            onImportClick={handleImportClick}
            lastSavedAt={lastSavedAt}
            visibleTabs={visibleTabs}
            onOpenNavSettings={() => setIsNavSettingsOpen(true)}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        ) : (
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onExport={handleExport}
            onImportClick={handleImportClick}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            lastSavedAt={lastSavedAt}
            visibleTabs={visibleTabs}
            onOpenNavSettings={() => setIsNavSettingsOpen(true)}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible">
        {/* TopBar with KPIs */}
        <div className="print:hidden">
          <TopBar
            activeTab={activeTab}
            totalIncome={totalIncome}
            totalExpenses={totalFixExpenses}
            netSavings={netSavings}
            totalRestDebt={kreditRestDebt}
            kreditMonthlyRate={kreditMonthlyRate}
            kreditRestDebt={kreditRestDebt}
            kreditActiveCount={kreditActiveCount}
            kreditTotalCount={kreditTotalCount}
            kreditPaidDebt={kreditPaidDebt}
            kreditPaidPercent={kreditPaidPercent}
            kreditDebtFreeDate={kreditDebtSim.dateDisplay}
            kreditDebtFreeDuration={kreditDebtSim.durationBadge}
            isPortrait={isPortrait}
          />
        </div>

        {/* Tab Views with Smooth Scrolling */}
        <main className={`flex-1 overflow-y-auto ${isPortrait ? 'p-3 sm:p-5' : 'p-4 sm:p-6 lg:p-8'} max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:overflow-visible print:h-auto`}>
          {activeTab === 'cockpit' && (
            <CockpitTab
              categories={data.fix.categories}
              incomeGroups={data.income.groups}
              kredite={data.kredite}
              energie={data.energie}
              lohn={data.lohn}
              konten={data.konten}
              portfolio={data.portfolio}
              onNavigate={handleNavigate}
            />
          )}

          {(activeTab === 'finanzen' || activeTab === 'fix') && (
            <FinanzenTab
              categories={data.fix.categories}
              incomeGroups={data.income.groups}
              expenseGroups={data.income.expenseGroups}
              onUpdateCategories={(cats) =>
                setData((prev) => ({ ...prev, fix: { ...prev.fix, categories: cats } }))
              }
              onUpdateIncomeGroups={(groups) =>
                setData((prev) => ({ ...prev, income: { ...prev.income, groups } }))
              }
              onUpdateExpenseGroups={(expenseGroups) =>
                setData((prev) => ({ ...prev, income: { ...prev.income, expenseGroups } }))
              }
            />
          )}

          {activeTab === 'kredite' && (
            <KrediteTab
              kredite={data.kredite}
              categoryFilter={kreditCategoryFilter}
              onCategoryFilterChange={setKreditCategoryFilter}
              onUpdateKredite={(kredite) => setData((prev) => ({ ...prev, kredite }))}
            />
          )}

          {activeTab === 'energie' && (
            <EnergieTab
              energie={data.energie}
              onUpdateEnergie={(energie) => setData((prev) => ({ ...prev, energie }))}
            />
          )}

          {activeTab === 'lohn' && (
            <LohnTab
              lohn={data.lohn}
              onUpdateLohn={(lohn) => setData((prev) => ({ ...prev, lohn }))}
            />
          )}

          {activeTab === 'konten' && (
            <KontenTab
              konten={data.konten}
              onUpdateKonten={(konten) => setData((prev) => ({ ...prev, konten }))}
              notfallKonten={data.notfallKonten || initialNotfallKonten}
              onUpdateNotfallKonten={(notfallKonten) =>
                setData((prev) => ({ ...prev, notfallKonten }))
              }
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioTab
              assets={data.portfolio || []}
              onUpdateAssets={(portfolio) => setData((prev) => ({ ...prev, portfolio }))}
            />
          )}
        </main>
      </div>

      {/* Settings Modal (Menüpunkte & Vollbild) */}
      <NavSettingsModal
        isOpen={isNavSettingsOpen}
        onClose={() => setIsNavSettingsOpen(false)}
        visibleTabs={visibleTabs}
        onToggleTab={handleToggleTab}
        onResetAll={handleResetVisibleTabs}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
