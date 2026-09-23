import React, { useState } from 'react';
import {
  ShieldAlert,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { NotfallKonto, VollmachtStatus } from '../types';

interface NotfallCockpitProps {
  notfallKonten: NotfallKonto[];
  onUpdateNotfallKonten: (updated: NotfallKonto[]) => void;
}

export const NotfallCockpit: React.FC<NotfallCockpitProps> = ({
  notfallKonten = [],
  onUpdateNotfallKonten,
}) => {
  const [filter, setFilter] = useState<'all' | 'moeglich_aber_offen' | 'moeglich_und_erteilt' | 'nicht_moeglich'>('all');
  const [editingItem, setEditingItem] = useState<NotfallKonto | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formInstitut, setFormInstitut] = useState('');
  const [formKategorie, setFormKategorie] = useState<'giro_tagesgeld' | 'depot_krypto' | 'kredit'>('giro_tagesgeld');
  const [formVollmachtStatus, setFormVollmachtStatus] = useState<VollmachtStatus>('moeglich_aber_offen');
  const [formAnleitung, setFormAnleitung] = useState('');
  const [formKontakt, setFormKontakt] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleToggleVollmacht = (id: string) => {
    const updated = notfallKonten.map((k) => {
      if (k.id === id) {
        if (k.vollmachtStatus === 'nicht_moeglich') return k;
        const newStatus: VollmachtStatus =
          k.vollmachtStatus === 'moeglich_und_erteilt'
            ? 'moeglich_aber_offen'
            : 'moeglich_und_erteilt';
        return { ...k, vollmachtStatus: newStatus };
      }
      return k;
    });
    onUpdateNotfallKonten(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchtest du diesen Notfall-Eintrag wirklich löschen?')) {
      onUpdateNotfallKonten(notfallKonten.filter((k) => k.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setFormInstitut('');
    setFormKategorie('giro_tagesgeld');
    setFormVollmachtStatus('moeglich_aber_offen');
    setFormAnleitung('');
    setFormKontakt('');
    setIsAdding(true);
    setEditingItem(null);
  };

  const handleOpenEdit = (item: NotfallKonto) => {
    setEditingItem(item);
    setFormInstitut(item.institut);
    setFormKategorie(item.kategorie);
    setFormVollmachtStatus(item.vollmachtStatus);
    setFormAnleitung(item.anleitungEhepartner);
    setFormKontakt(item.notfallKontakt || '');
    setIsAdding(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInstitut.trim() || !formAnleitung.trim()) return;

    if (editingItem) {
      const updated = notfallKonten.map((k) =>
        k.id === editingItem.id
          ? {
              ...k,
              institut: formInstitut.trim(),
              kategorie: formKategorie,
              vollmachtStatus: formVollmachtStatus,
              anleitungEhepartner: formAnleitung.trim(),
              notfallKontakt: formKontakt.trim() || undefined,
            }
          : k
      );
      onUpdateNotfallKonten(updated);
    } else {
      const newItem: NotfallKonto = {
        id: 'nf-' + Date.now(),
        institut: formInstitut.trim(),
        kategorie: formKategorie,
        vollmachtStatus: formVollmachtStatus,
        anleitungEhepartner: formAnleitung.trim(),
        notfallKontakt: formKontakt.trim() || undefined,
      };
      onUpdateNotfallKonten([...notfallKonten, newItem]);
    }

    setIsAdding(false);
    setEditingItem(null);
  };

  const filtered = notfallKonten.filter((k) => {
    if (filter === 'all') return true;
    return k.vollmachtStatus === filter;
  });

  const countOffen = notfallKonten.filter((k) => k.vollmachtStatus === 'moeglich_aber_offen').length;
  const countErteilt = notfallKonten.filter((k) => k.vollmachtStatus === 'moeglich_und_erteilt').length;
  const countNichtMoeglich = notfallKonten.filter((k) => k.vollmachtStatus === 'nicht_moeglich').length;

  return (
    <div className="space-y-6">
      {/* Printable Header - visible only when printing */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              NOTFALL- &amp; NACHLASS-LEITFADEN
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Wichtige Instruktionen für Angehörige &amp; Ehepartner im Erbfall • Erstellt am:{' '}
              {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>
          <div className="text-right text-xs font-semibold text-slate-700">
            {notfallKonten.length} erfasste Institute
          </div>
        </div>
        <div className="mt-3 p-3 bg-slate-100 border border-slate-300 rounded text-xs text-slate-800 leading-relaxed">
          <strong>WICHTIGER RECHTSHINWEIS:</strong> Bei Bekanntwerden eines Todesfalls werden Online-Zugänge
          und 2FA-Geräte (Handy) des Verstorbenen gesperrt. Ein Login mit alten Zugangsdaten ist unzulässig.
          Bitte nutzen Sie ausschließlich die nachfolgend aufgeführten, offiziellen Wege der Banken und Broker.
        </div>
      </div>

      {/* Main Screen Header & Shield Warning */}
      <div className="bg-[#11221c] border border-emerald-950/80 rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden print:hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Notfall- &amp; Nachlass-Cockpit</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                  Offizieller Wegweiser für Angehörige (Ehepartner) im Erbfall.
                </p>
              </div>
            </div>

            {/* Red Alert Banner */}
            <div className="mt-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">
                  Wichtiges Verhalten im Todesfall:
                </strong>
                Beim Bekanntwerden eines Todesfalls werden Online-Zugänge und 2FA-Geräte (Handy) des
                Verstorbenen von den Instituten sofort gesperrt. Ein Login mit alten Zugangsdaten ist nicht
                möglich und verstößt gegen die AGB. Bitte nutzen Sie ausschließlich die unten stehenden,
                offiziellen Wege.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Notfall-Plan drucken</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Neues Institut</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar (Screen only) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#d8e2de] print:hidden">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'bg-[#f0f4f2] text-[#5f7069] hover:text-[#14231f]'
            }`}
          >
            <span>Alle Institute</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-extrabold">
              {notfallKonten.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('moeglich_aber_offen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'moeglich_aber_offen'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
            }`}
          >
            <span>Vollmacht fehlt</span>
            {countOffen > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-extrabold">
                {countOffen}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter('moeglich_und_erteilt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'moeglich_und_erteilt'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
            }`}
          >
            <span>Vollmacht erteilt</span>
            {countErteilt > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-extrabold">
                {countErteilt}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter('nicht_moeglich')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'nicht_moeglich'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200/60 hover:bg-rose-100'
            }`}
          >
            <span>Keine Vollmacht möglich</span>
            {countNichtMoeglich > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 font-extrabold">
                {countNichtMoeglich}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium px-2">
          Status: <strong className="text-emerald-700">{countErteilt} erteilt</strong>,{' '}
          <strong className="text-amber-700">{countOffen} offen</strong>,{' '}
          <strong className="text-rose-700">{countNichtMoeglich} erbscheinpflichtig</strong>
        </div>
      </div>

      {/* Grid of Emergency Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isErteilt = item.vollmachtStatus === 'moeglich_und_erteilt';
          const isOffen = item.vollmachtStatus === 'moeglich_aber_offen';
          const isNichtMoeglich = item.vollmachtStatus === 'nicht_moeglich';

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between bg-white shadow-xs hover:shadow-md ${
                isErteilt
                  ? 'border-emerald-200/90'
                  : isOffen
                  ? 'border-amber-200'
                  : 'border-rose-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {item.institut}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                      {item.kategorie === 'giro_tagesgeld'
                        ? 'Giro & Tagesgeld'
                        : item.kategorie === 'depot_krypto'
                        ? 'Depot / Krypto'
                        : 'Kredit / Finanzierung'}
                    </span>
                  </div>

                  {/* Actions for editing or deleting */}
                  <div className="flex items-center gap-1 print:hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                      title="Eintrag bearbeiten"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Eintrag löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isErteilt && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Vollmacht erteilt (Eigener Zugang)</span>
                    </div>
                  )}

                  {isOffen && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300/80 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Vollmacht fehlt! (Handlungsbedarf zu Lebzeiten)</span>
                    </div>
                  )}

                  {isNichtMoeglich && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 font-bold text-xs">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Keine Vollmacht möglich (Erbschein nötig)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body - Instruction Block */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    HANDLUNGSANWEISUNG FÜR ANGEHÖRIGE:
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                    {item.anleitungEhepartner}
                  </div>
                </div>

                {/* Contact Field */}
                {item.notfallKontakt && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      SUPPORT- / NOTFALLKONTAKT:
                    </span>
                    {item.notfallKontakt.includes('@') ? (
                      <a
                        href={`mailto:${item.notfallKontakt}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline bg-emerald-50/70 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.notfallKontakt}</span>
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.notfallKontakt}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Interactive Toggle-Switch for Account Owner */}
              <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2 print:hidden">
                {!isNichtMoeglich ? (
                  <label className="flex items-center justify-between w-full cursor-pointer select-none">
                    <span className="text-xs font-semibold text-slate-700">
                      Transmortale Vollmacht eingerichtet
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isErteilt}
                      onClick={() => handleToggleVollmacht(item.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isErteilt ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isErteilt ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ) : (
                  <div className="text-[11px] font-semibold text-slate-400 italic flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Keine Vollmacht möglich (Gesetzlich gesperrt)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#11221c] text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>{editingItem ? 'Notfall-Eintrag bearbeiten' : 'Neues Notfall-Institut anlegen'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Name des Instituts / Bank *
                </label>
                <input
                  type="text"
                  required
                  value={formInstitut}
                  onChange={(e) => setFormInstitut(e.target.value)}
                  placeholder="z.B. Deutsche Bank, Trade Republic..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kategorie
                  </label>
                  <select
                    value={formKategorie}
                    onChange={(e) => setFormKategorie(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="giro_tagesgeld">Giro &amp; Tagesgeld</option>
                    <option value="depot_krypto">Depot / Krypto</option>
                    <option value="kredit">Kredit / Finanzierung</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Vollmacht-Status
                  </label>
                  <select
                    value={formVollmachtStatus}
                    onChange={(e) => setFormVollmachtStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="moeglich_aber_offen">Vollmacht fehlt! (Offen)</option>
                    <option value="moeglich_und_erteilt">Vollmacht erteilt (Aktiv)</option>
                    <option value="nicht_moeglich">Keine Vollmacht möglich</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Handlungsanweisung für Angehörige *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formAnleitung}
                  onChange={(e) => setFormAnleitung(e.target.value)}
                  placeholder="Konkrete Schritte beschreiben..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-emerald-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Support- oder Notfallkontakt (E-Mail / Link)
                </label>
                <input
                  type="text"
                  value={formKontakt}
                  onChange={(e) => setFormKontakt(e.target.value)}
                  placeholder="z.B. deceased@revolut.com oder Support-URL"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600 cursor-pointer shadow-xs"
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
