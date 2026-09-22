import React from 'react';
import {
  Layers,
  LayoutDashboard,
  Wallet,
  Landmark,
  Zap,
  TrendingUp,
  LineChart,
  ShieldCheck,
  Download,
  Upload,
  Settings,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { TabKey } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TopNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onExport: () => void;
  onImportClick: () => void;
  lastSavedAt: Date | null;
  visibleTabs: Record<TabKey, boolean>;
  onOpenNavSettings: () => void;
  hasUnsavedChanges?: boolean;
}

const navItemsList: { key: TabKey; icon: React.ElementType }[] = [
  { key: 'cockpit', icon: LayoutDashboard },
  { key: 'finanzen', icon: Wallet },
  { key: 'kredite', icon: Landmark },
  { key: 'energie', icon: Zap },
  { key: 'lohn', icon: TrendingUp },
  { key: 'portfolio', icon: LineChart },
  { key: 'konten', icon: ShieldCheck },
];

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
  onExport,
  onImportClick,
  lastSavedAt,
  visibleTabs,
  onOpenNavSettings,
  hasUnsavedChanges = false,
}) => {
  const t = TRANSLATIONS.de;
  const displayedNavItems = navItemsList.filter((item) => visibleTabs[item.key] !== false);

  return (
    <header className="bg-[#14231f] text-[#d6dedb] border-b border-[#203932] shadow-md z-30 shrink-0 select-none">
      {/* Upper Utility Row */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#1b312b]">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2a6855] to-[#174638] flex items-center justify-center text-white shadow-sm border border-[#3e846f]/30 shrink-0">
            <Layers className="w-4 h-4 text-[#86efac]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight">Finanz-Cockpit</span>
            {lastSavedAt && (
              <span className="hidden md:inline-block text-[10px] text-[#718b81] border-l border-[#23433a] pl-2.5 ml-1 font-medium">
                Zuletzt aktualisiert:{' '}
                {lastSavedAt.toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                {lastSavedAt.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Right Tools: Backup, Import, Settings */}
        <div className="flex items-center gap-2">
          {/* Warning badge in header if unsaved changes */}
          {hasUnsavedChanges && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Änderungen nicht als JSON gesichert!</span>
            </div>
          )}

          {/* Backup Button */}
          <div className="relative">
            <button
              onClick={onExport}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[#1b312b] hover:bg-[#25443b] text-[#c8d6d1] hover:text-white border border-[#2b4c42]/50'
              }`}
              title={
                hasUnsavedChanges
                  ? 'Warnung: Ungesicherte Änderungen! Bitte JSON Backup herunterladen'
                  : 'JSON Backup herunterladen'
              }
            >
              <Download
                className={`w-3.5 h-3.5 ${
                  hasUnsavedChanges ? 'text-amber-400 animate-bounce' : 'text-[#86efac]'
                }`}
              />
              <span className="hidden sm:inline">
                {hasUnsavedChanges ? 'JSON sichern!' : t.navigation.exportBtn}
              </span>
            </button>
            {hasUnsavedChanges && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b312b] hover:bg-[#25443b] text-xs font-semibold text-[#c8d6d1] hover:text-white transition-colors border border-[#2b4c42]/50 active:scale-95 cursor-pointer"
            title="JSON Backup wiederherstellen"
          >
            <Upload className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">{t.navigation.importBtn}</span>
          </button>

          {/* PayPal Donate Button */}
          <a
            href="https://paypal.me/tayfunaksoy"
            target="_blank"
            rel="noopener noreferrer"
            title="Spenden via PayPal (paypal.me/tayfunaksoy)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#15803d]/20 hover:bg-[#15803d]/30 text-xs font-semibold text-[#86efac] hover:text-white transition-colors border border-[#15803d]/40 active:scale-95 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-[#ef4444]" />
            <span className="hidden sm:inline">Spenden</span>
          </a>

          {/* Settings Button: renamed to "Einstellungen" per user request */}
          <button
            onClick={onOpenNavSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b312b] hover:bg-[#25443b] text-xs font-semibold text-[#86efac] hover:text-white transition-colors border border-[#2b4c42]/50 active:scale-95 cursor-pointer"
            title={t.navigation.settingsTooltip}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.navigation.settingsBtn}</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Horizontal Navigation Tabs (Icons only on mobile, with labels on tablet/desktop) */}
      <nav className="px-1.5 py-1.5 flex items-stretch justify-between gap-1 w-full overflow-hidden">
        {displayedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const meta = t.navigation.tabs[item.key];

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-2 sm:py-1.5 rounded-xl font-medium text-[11px] sm:text-xs transition-all duration-150 relative min-h-[40px] sm:min-h-[48px] cursor-pointer text-center leading-tight ${
                isActive
                  ? 'bg-[#235848] text-white shadow-md shadow-black/20 font-semibold'
                  : 'text-[#9cb3aa] hover:bg-[#1b312b] hover:text-[#e4ece9]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#86efac]' : 'text-[#809b90]'
                }`}
              />
              <span className="hidden sm:inline truncate max-w-full text-[11px] sm:text-xs leading-tight">
                {meta.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#34d399] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
