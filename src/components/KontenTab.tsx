import React, { useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Building,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';
import { KontoRecord, NotfallKonto } from '../types';
import { generateId } from '../utils/formatters';
import { NotfallCockpit } from './NotfallCockpit';
import { initialNotfallKonten } from '../data/initialData';

interface KontenTabProps {
  konten: KontoRecord[];
  onUpdateKonten: (konten: KontoRecord[]) => void;
  notfallKonten?: NotfallKonto[];
  onUpdateNotfallKonten?: (notfallKonten: NotfallKonto[]) => void;
}

export const KontenTab: React.FC<KontenTabProps> = ({
  konten,
  onUpdateKonten,
  notfallKonten,
  onUpdateNotfallKonten,
}) => {
  const [localNotfall, setLocalNotfall] = useState<NotfallKonto[]>(initialNotfallKonten);

  const activeNotfall = notfallKonten || localNotfall;
  const handleUpdateNotfall = (updated: NotfallKonto[]) => {
    if (onUpdateNotfallKonten) {
      onUpdateNotfallKonten(updated);
    } else {
      setLocalNotfall(updated);
    }
  };
  const [addingCategory, setAddingCategory] = useState<'bank' | 'depot' | null>(null);
  const [newKontoKategorie, setNewKontoKategorie] = useState<'bank' | 'kredit' | 'depot' | 'krypto'>('bank');
  const [newKontoName, setNewKontoName] = useState('');
  const [newKontoLink, setNewKontoLink] = useState('');
  const [newKontoNotiz, setNewKontoNotiz] = useState('');
  const [newKontoUsername, setNewKontoUsername] = useState('');
  const [newKontoHas2FA, setNewKontoHas2FA] = useState(false);
  const [newKontoHasSecurityCodes, setNewKontoHasSecurityCodes] = useState(false);

  const handlePrint = () => {
    try {
      window.focus();
      setTimeout(() => {
        try {
          window.print();
        } catch (err) {
          console.error('Print call failed:', err);
          try {
            if (window.top) {
              window.top.focus();
              window.top.print();
            }
          } catch (e2) {
            console.error('Top window print failed:', e2);
          }
        }
      }, 50);
    } catch (e) {
      console.error('Print handler error:', e);
    }
  };

  const getEffectiveCategory = (k: KontoRecord): 'bank' | 'depot' => {
    if (k.kategorie === 'depot' || k.kategorie === 'krypto') return 'depot';
    if (k.kategorie === 'bank' || k.kategorie === 'kredit') return 'bank';
    const n = (k.name + ' ' + k.notiz).toLowerCase();
    if (
      n.includes('scalable') ||
      n.includes('kraken') ||
      n.includes('trade') ||
      n.includes('crypto') ||
      n.includes('krypto') ||
      n.includes('depot') ||
      n.includes('coinbase') ||
      n.includes('etf')
    ) {
      return 'depot';
    }
    return 'bank';
  };

  const handleUpdate = (id: string, field: keyof KontoRecord, value: string) => {
    onUpdateKonten(
      konten.map((k) => (k.id === id ? { ...k, [field]: value } : k))
    );
  };

  const handleToggleBool = (id: string, field: 'has2FA' | 'hasSecurityCodes') => {
    onUpdateKonten(
      konten.map((k) => (k.id === id ? { ...k, [field]: !k[field] } : k))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Dieses Institut wirklich aus der Notfall-Liste entfernen?')) {
      onUpdateKonten(konten.filter((k) => k.id !== id));
    }
  };

  const handleAddSubmit = (category: 'bank' | 'depot') => {
    if (!newKontoName.trim()) return;
    const newKonto: KontoRecord = {
      id: generateId('konto'),
      name: newKontoName.trim(),
      link: newKontoLink.trim(),
      notiz: newKontoNotiz.trim(),
      username: newKontoUsername.trim(),
      has2FA: newKontoHas2FA,
      hasSecurityCodes: newKontoHasSecurityCodes,
      kategorie: newKontoKategorie,
    };
    onUpdateKonten([...konten, newKonto]);
    setNewKontoName('');
    setNewKontoLink('');
    setNewKontoNotiz('');
    setNewKontoUsername('');
    setNewKontoHas2FA(false);
    setNewKontoHasSecurityCodes(false);
    setAddingCategory(null);
  };

  const banken = konten.filter((k) => getEffectiveCategory(k) === 'bank');
  const depots = konten.filter((k) => getEffectiveCategory(k) === 'depot');

  const renderKontoCard = (k: KontoRecord, isDepot: boolean) => {
    const notizLower = (k.notiz || '').toLowerCase();
    const nameLower = (k.name || '').toLowerCase();
    const isKreditType =
      k.kategorie === 'kredit' ||
      (!k.kategorie &&
        !isDepot &&
        (notizLower.includes('kredit') ||
          notizLower.includes('darlehen') ||
          notizLower.includes('immo') ||
          notizLower.includes('finanzierung') ||
          notizLower.includes('hypothek') ||
          nameLower.includes('kredit') ||
          nameLower.includes('darlehen') ||
          nameLower.includes('finanzierung')));

    return (
      <div
        key={k.id}
        className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between break-inside-avoid print:border-slate-300 print:shadow-none"
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isDepot
                    ? 'bg-sky-50 text-sky-600'
                    : isKreditType
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {isDepot ? (
                  <CreditCard className="w-4 h-4" />
                ) : isKreditType ? (
                  <Landmark className="w-4 h-4" />
                ) : (
                  <Building className="w-4 h-4" />
                )}
              </div>

              <div className="flex flex-col flex-1 min-w-0 gap-1">
                <input
                  type="text"
                  value={k.name}
                  onChange={(e) => handleUpdate(k.id, 'name', e.target.value)}
                  placeholder="Name des Instituts..."
                  className="print:hidden font-bold text-base text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none px-1 py-0.5 rounded w-full"
                />
                <span className="hidden print:inline font-bold text-base text-slate-800">
                  {k.name}
                </span>

                <div>
                  <select
                    value={
                      k.kategorie ||
                      (isDepot ? (nameLower.includes('krypto') || notizLower.includes('krypto') ? 'krypto' : 'depot') : isKreditType ? 'kredit' : 'bank')
                    }
                    onChange={(e) => handleUpdate(k.id, 'kategorie', e.target.value)}
                    className={`print:hidden text-[11px] font-bold px-2 py-0.5 rounded-lg focus:outline-none cursor-pointer border transition-colors inline-block ${
                      isDepot
                        ? 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100'
                        : isKreditType
                        ? 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                    }`}
                    title="Kategorie / Konto-Art ändern"
                  >
                    {!isDepot ? (
                      <>
                        <option value="bank">Girokonto</option>
                        <option value="kredit">Kredit</option>
                      </>
                    ) : (
                      <>
                        <option value="depot">Wertpapier-Depot</option>
                        <option value="krypto">Krypto-Wallet</option>
                      </>
                    )}
                  </select>
                  <span
                    className={`hidden print:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isDepot
                        ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                        : isKreditType
                        ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {isDepot ? 'Depot/Krypto' : isKreditType ? 'Kredit' : 'Girokonto'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(k.id)}
              className="print:hidden p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Institut löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        {/* Content-Bereich (schlank) */}
        <div className="space-y-2.5 mb-3">
          {/* Benutzername / Login-ID */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              BENUTZERNAME / LOGIN-ID
            </label>
            <input
              type="text"
              value={k.username || ''}
              onChange={(e) => handleUpdate(k.id, 'username', e.target.value)}
              placeholder="z.B. Max.Mustermann / Kundennr..."
              className="print:hidden w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <div className="hidden print:block text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2">
              {k.username || '— Kein Benutzername hinterlegt —'}
            </div>
          </div>

          {/* Notiz / Zweck */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              NOTIZ / ZWECK
            </label>
            <input
              type="text"
              value={k.notiz}
              onChange={(e) => handleUpdate(k.id, 'notiz', e.target.value)}
              placeholder="z.B. Giro & Tagesgeld, Gehaltskonto..."
              className="print:hidden w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <div className="hidden print:block text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">
              {k.notiz || '— Keine Notizen hinterlegt —'}
            </div>
          </div>

          {/* Web-Adresse */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              WEB-ADRESSE
            </label>
            <input
              type="text"
              value={k.link}
              onChange={(e) => handleUpdate(k.id, 'link', e.target.value)}
              placeholder="https://..."
              className="print:hidden w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono"
            />
            <div className="hidden print:block text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 break-all">
              {k.link || '— Kein Direktlink hinterlegt —'}
            </div>
          </div>

          {/* Sicherheit & 2FA (Checkboxes) */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              SICHERHEIT &amp; 2FA ZUGANG
            </label>
            <div className="grid grid-cols-2 gap-1.5 print:hidden">
              <button
                type="button"
                onClick={() => handleToggleBool(k.id, 'has2FA')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  k.has2FA
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                    k.has2FA
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {k.has2FA && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">2FA aktiviert</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleBool(k.id, 'hasSecurityCodes')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  k.hasSecurityCodes
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                    k.hasSecurityCodes
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {k.hasSecurityCodes && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">Backup-Codes</span>
              </button>
            </div>

            {/* Print View */}
            <div className="hidden print:flex items-center gap-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2">
              <span className="font-semibold">
                2FA: {k.has2FA ? '✓ Aktiviert' : '✗ Deaktiviert'}
              </span>
              <span className="font-semibold">
                Backup-Codes: {k.hasSecurityCodes ? '✓ Vorhanden' : '✗ Nicht vorhanden'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Login Button */}
      <div className="pt-2 border-t border-slate-100 print:hidden">
        {k.link ? (
          <a
            href={k.link.startsWith('http') ? k.link : `https://${k.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>Direkt zum Login</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              const url = prompt('Bitte Web-Adresse / Login-Link eingeben:');
              if (url) handleUpdate(k.id, 'link', url);
            }}
            className="w-full h-[36px] bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-medium text-xs rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>+ Link hinterlegen</span>
          </button>
        )}
      </div>
    </div>
  );
};

  const renderAddCard = (category: 'bank' | 'depot') => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddSubmit(category);
      }}
      className="bg-emerald-50/60 rounded-2xl border-2 border-dashed border-emerald-300 p-4 shadow-xs flex flex-col justify-between space-y-3 animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          {category === 'bank' ? 'Neues Bankinstitut / Kredit' : 'Neues Depot / Krypto-Wallet'}
        </span>
        <button
          type="button"
          onClick={() => {
            setAddingCategory(null);
            setNewKontoName('');
            setNewKontoLink('');
            setNewKontoNotiz('');
          }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            KONTO-TYP / ART *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {category === 'bank' ? (
              <>
                <button
                  type="button"
                  onClick={() => setNewKontoKategorie('bank')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    newKontoKategorie === 'bank'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Girokonto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewKontoKategorie('kredit')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    newKontoKategorie === 'kredit'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Kredit</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setNewKontoKategorie('depot')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    newKontoKategorie === 'depot'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Wertpapier-Depot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewKontoKategorie('krypto')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    newKontoKategorie === 'krypto'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Krypto-Wallet</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            INSTITUTSNAME *
          </label>
          <input
            type="text"
            autoFocus
            required
            value={newKontoName}
            onChange={(e) => setNewKontoName(e.target.value)}
            placeholder={
              category === 'bank'
                ? newKontoKategorie === 'kredit'
                  ? 'z.B. Baufi Direkt, Barclaycard...'
                  : 'z.B. Sparkasse, ING, DKB...'
                : newKontoKategorie === 'krypto'
                ? 'z.B. Coinbase, Ledger, Bitvavo...'
                : 'z.B. Trade Republic, Scalable...'
            }
            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            BENUTZERNAME / LOGIN-ID
          </label>
          <input
            type="text"
            value={newKontoUsername}
            onChange={(e) => setNewKontoUsername(e.target.value)}
            placeholder="z.B. Max.Mustermann / Kundennr..."
            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            NOTIZ / ZWECK
          </label>
          <input
            type="text"
            value={newKontoNotiz}
            onChange={(e) => setNewKontoNotiz(e.target.value)}
            placeholder="z.B. Gehaltskonto, Immo-Finanzierung..."
            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
            WEB-ADRESSE
          </label>
          <input
            type="text"
            value={newKontoLink}
            onChange={(e) => setNewKontoLink(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-600 font-mono"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            SICHERHEIT &amp; ZUGANG
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNewKontoHas2FA(!newKontoHas2FA)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                newKontoHas2FA
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                  newKontoHas2FA
                    ? 'bg-white text-emerald-700 border-white'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                {newKontoHas2FA && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate">2FA aktiviert</span>
            </button>

            <button
              type="button"
              onClick={() => setNewKontoHasSecurityCodes(!newKontoHasSecurityCodes)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                newKontoHasSecurityCodes
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                  newKontoHasSecurityCodes
                    ? 'bg-white text-emerald-700 border-white'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                {newKontoHasSecurityCodes && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate">Backup-Codes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            setAddingCategory(null);
            setNewKontoName('');
            setNewKontoLink('');
            setNewKontoNotiz('');
            setNewKontoUsername('');
            setNewKontoHas2FA(false);
            setNewKontoHasSecurityCodes(false);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          Hinzufügen
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Print Header */}
      <div className="hidden print:block mb-5 pb-3 border-b-2 border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              FAMILIEN-NOTFALLÜBERSICHT: BANKEN &amp; DEPOTS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Vertrauliche Notfall-Übersicht • Stand: {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-medium">
            {banken.length} Banken • {depots.length} Depots / Broker
          </div>
        </div>
      </div>

      {/* 1. Notfall- & Nachlass-Cockpit */}
      <NotfallCockpit
        notfallKonten={activeNotfall}
        onUpdateNotfallKonten={handleUpdateNotfall}
      />

      {/* 2. & 3. Sektions-Header & Card-Grids */}
      <div className="space-y-6">
        {/* SEKTION 1: BANKEN & GIROKONTEN */}
        <div className="space-y-3">
          <div className="pb-2 border-b border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>BANKEN &amp; GIROKONTEN ({banken.length})</span>
            </h3>

            <div>
              <button
                type="button"
                onClick={() => {
                  setAddingCategory('bank');
                  setNewKontoKategorie('bank');
                  setNewKontoName('');
                  setNewKontoLink('');
                  setNewKontoNotiz('');
                }}
                className="print:hidden w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neues Institut hinzufügen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addingCategory === 'bank' && renderAddCard('bank')}
            {banken.map((k) => renderKontoCard(k, false))}
            {banken.length === 0 && addingCategory !== 'bank' && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
                Keine Bankkonten erfasst.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAddingCategory('bank');
                    setNewKontoKategorie('bank');
                  }}
                  className="text-emerald-700 font-bold underline hover:text-emerald-800 cursor-pointer"
                >
                  Jetzt ein Bankkonto hinzufügen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEKTION 2: DEPOTS, BROKER & KRYPTO */}
        <div className="space-y-3 pt-2">
          <div className="pb-2 border-b border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>DEPOTS, BROKER &amp; KRYPTO ({depots.length})</span>
            </h3>

            <div>
              <button
                type="button"
                onClick={() => {
                  setAddingCategory('depot');
                  setNewKontoKategorie('depot');
                  setNewKontoName('');
                  setNewKontoLink('');
                  setNewKontoNotiz('');
                }}
                className="print:hidden w-full text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neues Depot hinzufügen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addingCategory === 'depot' && renderAddCard('depot')}
            {depots.map((k) => renderKontoCard(k, true))}
            {depots.length === 0 && addingCategory !== 'depot' && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs">
                Keine Depots oder Krypto-Konten erfasst.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAddingCategory('depot');
                    setNewKontoKategorie('depot');
                  }}
                  className="text-sky-700 font-bold underline hover:text-sky-800 cursor-pointer"
                >
                  Jetzt ein Depot hinzufügen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
