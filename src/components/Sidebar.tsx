import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  Zap,
  TrendingUp,
  ShieldCheck,
  LineChart,
  Download,
  Upload,
  Layers,
  ChevronLeft,
  ChevronRight,
  Settings,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import { TabKey } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onExport: () => void;
  onImportClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onExport,
  onImportClick,
  isCollapsed,
  onToggleCollapse,
  lastSavedAt,
  visibleTabs,
  onOpenNavSettings,
  hasUnsavedChanges = false,
}) => {
  const t = TRANSLATIONS.de;
  const displayedNavItems = navItemsList.filter((item) => visibleTabs[item.key] !== false);

  return (
    <aside
      className={`relative flex flex-col bg-[#14231f] text-[#d6dedb] transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } border-r border-[#203932] shadow-xl shrink-0 h-full`}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#203932] flex items-center min-h-[72px] relative transition-all ${
          isCollapsed ? 'justify-center px-2 py-4' : 'justify-between p-4'
        }`}
      >
        {isCollapsed ? (
          <>
            {/* Centered Logo Icon (unclipped, clicking expands sidebar) */}
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a6855] to-[#174638] flex items-center justify-center text-white shadow-md border border-[#3e846f]/30 shrink-0 hover:scale-105 transition-transform group cursor-pointer"
              title="Sidebar ausklappen"
            >
              <Layers className="w-5 h-5 text-[#86efac] group-hover:hidden" />
              <ChevronRight className="w-5 h-5 text-white hidden group-hover:block" />
            </button>

            {/* Edge Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#14231f] hover:bg-[#203932] text-[#86efac] hover:text-white border border-[#2b4c42] shadow-md flex items-center justify-center transition-colors z-40 cursor-pointer"
              title="Sidebar ausklappen"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a6855] to-[#174638] flex items-center justify-center text-white shadow-md border border-[#3e846f]/30 shrink-0">
                <Layers className="w-5 h-5 text-[#86efac]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-tight text-white truncate">
                  WIMG
                </span>
                <span className="text-[11px] text-[#7da395] font-medium tracking-wide">
                  Wo ist mein Geld
                </span>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#8ea69d] hover:text-white hover:bg-[#1b312b] transition-colors border border-[#2b4c42]/40 cursor-pointer"
              title="Sidebar einklappen"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {displayedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const meta = t.navigation.tabs[item.key];

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              title={isCollapsed ? meta.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-start'
              } gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                isActive
                  ? 'bg-[#2a6855] text-white shadow-lg shadow-black/20 font-semibold'
                  : 'text-[#a2b5ae] hover:bg-[#1b312b] hover:text-[#e4ece9]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#34d399] rounded-r-full" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#86efac]' : 'text-[#809b90] group-hover:text-white'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{meta.label}</span>
              )}
              {!isCollapsed && meta.badge && (
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-[#854d0e]/40 text-[#fde047] border border-[#ca8a04]/30">
                  {meta.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Settings Button - user requested: "und es soll nicht navigation anpassen heißen sondern einstellungen" */}
        <div className="pt-2 mt-2 border-t border-[#203932]/60">
          <button
            onClick={onOpenNavSettings}
            title={t.navigation.settingsTooltip}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-start'
            } gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#8ea69d] hover:text-[#86efac] hover:bg-[#1b312b] border border-dashed border-[#2b4c42]/60 transition-colors cursor-pointer`}
          >
            <Settings className="w-4 h-4 text-[#86efac] shrink-0" />
            {!isCollapsed && <span>{t.navigation.settingsBtn}</span>}
          </button>
        </div>
      </nav>

      {/* Footer / Backup & Sync */}
      <div className="p-3 border-t border-[#203932] bg-[#0f1b18]/60 space-y-2">
        {!isCollapsed && hasUnsavedChanges && (
          <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-[11px] flex flex-col gap-1.5 shadow-lg animate-pulse">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Daten sichern!</span>
            </div>
            <p className="text-[10px] text-amber-200/90 leading-tight">
              Änderungen vorgenommen. Bitte lade ein JSON-Backup herunter.
            </p>
          </div>
        )}

        {!isCollapsed && !hasUnsavedChanges && (
          <div className="px-2 py-1 flex items-center gap-2 text-[11px] text-[#86efac] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>{t.navigation.backupStatus}</span>
          </div>
        )}

        <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-1.5`}>
          <button
            onClick={onExport}
            title={hasUnsavedChanges ? "Warnung: Neue Änderungen! Bitte JSON Backup herunterladen" : "JSON Backup herunterladen"}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors active:scale-95 cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-[#1b312b] hover:bg-[#25443b] text-[#c8d6d1] hover:text-white border border-[#2b4c42]/50'
            }`}
          >
            <Download className={`w-4 h-4 ${hasUnsavedChanges ? 'text-amber-400 animate-bounce' : 'text-[#86efac]'}`} />
            {!isCollapsed && <span>{hasUnsavedChanges ? 'JSON sichern!' : t.navigation.exportBtn}</span>}
          </button>

          <button
            onClick={onImportClick}
            title="JSON Backup wiederherstellen"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#1b312b] hover:bg-[#25443b] text-xs font-semibold text-[#c8d6d1] hover:text-white transition-colors border border-[#2b4c42]/50 active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#38bdf8]" />
            {!isCollapsed && <span>{t.navigation.importBtn}</span>}
          </button>
        </div>

        <a
          href="https://paypal.me/tayfunaksoy"
          target="_blank"
          rel="noopener noreferrer"
          title="Spenden via PayPal (paypal.me/tayfunaksoy)"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#15803d]/20 hover:bg-[#15803d]/30 text-xs font-semibold text-[#86efac] hover:text-white transition-colors border border-[#15803d]/40 active:scale-95 cursor-pointer"
        >
          <Heart className="w-4 h-4 text-[#ef4444]" />
          {!isCollapsed && <span>Spenden (PayPal)</span>}
        </a>

        {!isCollapsed && (
          <div className="pt-1 text-center">
            <a
              href="https://github.com/tayfuuun/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#86efac] hover:text-white transition-colors font-medium inline-block"
            >
              Made by Tayfun ❤️
            </a>
          </div>
        )}

        {!isCollapsed && lastSavedAt && (
          <p className="text-[10px] text-[#6d847a] text-center pt-1">
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
          </p>
        )}
      </div>
    </aside>
  );
};
