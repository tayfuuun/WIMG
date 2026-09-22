import React, { useEffect } from 'react';
import {
  X,
  Settings,
  LayoutDashboard,
  Wallet,
  Landmark,
  Zap,
  TrendingUp,
  ShieldCheck,
  LineChart,
  RotateCcw,
  Info,
  Maximize2,
} from 'lucide-react';
import { TabKey } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface NavSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleTabs: Record<TabKey, boolean>;
  onToggleTab: (key: TabKey) => void;
  onResetAll: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const TAB_ICONS: Record<TabKey, React.ElementType> = {
  cockpit: LayoutDashboard,
  finanzen: Wallet,
  fix: Wallet,
  kredite: Landmark,
  energie: Zap,
  lohn: TrendingUp,
  konten: ShieldCheck,
  portfolio: LineChart,
};

const TAB_COLORS: Record<TabKey, { colorBg: string; colorText: string }> = {
  cockpit: { colorBg: 'bg-[#1e40af]/10', colorText: 'text-[#1e40af]' },
  finanzen: { colorBg: 'bg-[#0f766e]/10', colorText: 'text-[#0f766e]' },
  fix: { colorBg: 'bg-[#0f766e]/10', colorText: 'text-[#0f766e]' },
  kredite: { colorBg: 'bg-[#1e3a8a]/10', colorText: 'text-[#1e3a8a]' },
  energie: { colorBg: 'bg-[#eab308]/15', colorText: 'text-[#ca8a04]' },
  lohn: { colorBg: 'bg-[#15803d]/10', colorText: 'text-[#15803d]' },
  konten: { colorBg: 'bg-[#dc2626]/10', colorText: 'text-[#dc2626]' },
  portfolio: { colorBg: 'bg-[#d97706]/10', colorText: 'text-[#d97706]' },
};

const ORDERED_TABS: TabKey[] = ['cockpit', 'finanzen', 'kredite', 'energie', 'lohn', 'portfolio', 'konten'];

export const NavSettingsModal: React.FC<NavSettingsModalProps> = ({
  isOpen,
  onClose,
  visibleTabs,
  onToggleTab,
  onResetAll,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const t = TRANSLATIONS.de;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCount = ORDERED_TABS.length;
  const activeCount = ORDERED_TABS.filter((key) => visibleTabs[key] !== false).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#d8e2de] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[92vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#f0f4f2] bg-[#fafcfb] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14231f] text-white flex items-center justify-center shadow-xs shrink-0">
              <Settings className="w-5 h-5 text-[#86efac]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#14231f] flex items-center gap-2">
                {t.settings.modalTitle}
              </h2>
              <p className="text-xs text-[#5f7069] mt-0.5">
                Menüpunkte und Ansicht anpassen. Deine Daten bleiben stets erhalten.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#73877e] hover:text-[#14231f] hover:bg-[#eef2f0] transition-colors cursor-pointer"
            title={t.settings.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-[#edf2ef]">
          {/* SECTION: Navigation & Menu Items */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14231f]">
                {t.settings.navSection}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#166534] bg-[#dcfce7] px-2 py-0.5 rounded-full tabular-nums">
                  {t.settings.activeMenuCount(activeCount, totalCount)}
                </span>
                {activeCount < totalCount && (
                  <button
                    type="button"
                    onClick={onResetAll}
                    className="text-[11px] font-bold text-[#0f766e] hover:text-[#0b534d] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.settings.enableAll}</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-[#5f7069] mb-3.5">
              {t.settings.navDescription}
            </p>

            <div className="space-y-2.5">
              {ORDERED_TABS.map((tabKey) => {
                const Icon = TAB_ICONS[tabKey];
                const colors = TAB_COLORS[tabKey];
                const meta = t.navigation.tabs[tabKey];
                const isVisible = visibleTabs[tabKey] ?? true;
                const isOnlyOneActive = isVisible && activeCount <= 1;

                return (
                  <div
                    key={tabKey}
                    onClick={() => {
                      if (!isOnlyOneActive) {
                        onToggleTab(tabKey);
                      }
                    }}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all select-none ${
                      isVisible
                        ? 'bg-white border-[#d8e2de] hover:border-[#0f766e]/50 hover:shadow-xs cursor-pointer'
                        : 'bg-[#f9faf9] border-[#e5ebe8] opacity-60 hover:opacity-80 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.colorBg} ${colors.colorText}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold truncate ${
                              isVisible ? 'text-[#14231f]' : 'text-[#6b7280]'
                            }`}
                          >
                            {meta.label}
                          </span>
                          {meta.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-[#854d0e]/20 text-[#854d0e]">
                              {meta.badge}
                            </span>
                          )}
                          {!isVisible && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0f4f2] text-[#6b7280]">
                              {t.settings.hiddenBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5f7069] truncate mt-0.5">
                          {meta.description}
                        </p>
                      </div>
                    </div>

                    {/* Switch Toggle Button */}
                    <button
                      type="button"
                      disabled={isOnlyOneActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOnlyOneActive) {
                          onToggleTab(tabKey);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isOnlyOneActive ? 'cursor-not-allowed opacity-50' : ''
                      } ${isVisible ? 'bg-emerald-700' : 'bg-[#d1d5db]'}`}
                      title={
                        isOnlyOneActive
                          ? t.settings.onlyOneActiveWarning
                          : isVisible
                          ? `${meta.label} ${t.settings.hiddenBadge}`
                          : `${meta.label} ${t.settings.enableAll}`
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isVisible ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Safety Notice regarding data persistence */}
            <div className="bg-[#f0fdf4] rounded-2xl p-3.5 border border-[#bbf7d0]/80 flex items-start gap-2.5 mt-4 text-xs text-[#166534]">
              <Info className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t.settings.noDataLossTitle} </span>
                {t.settings.noDataLossDesc}
              </div>
            </div>
          </div>

          {/* SECTION: Vollbildmodus (Fullscreen) */}
          {onToggleFullscreen && (
            <div className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                <Maximize2 className="w-4 h-4 text-[#0f766e]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#14231f]">
                  {t.navigation.fullscreen}
                </h3>
              </div>
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-[#cbd5d1] hover:border-[#0f766e] bg-white text-left transition-all shadow-xs cursor-pointer"
              >
                <span className="text-xs font-bold text-[#14231f]">
                  {isFullscreen ? t.navigation.exitFullscreen : t.navigation.fullscreen}
                </span>
                <span className="text-xs text-[#0f766e] font-semibold">
                  {isFullscreen ? 'Vollbild beenden' : 'Vollbild aktivieren'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#fafcfb] border-t border-[#f0f4f2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            {t.settings.done}
          </button>
        </div>
      </div>
    </div>
  );
};
