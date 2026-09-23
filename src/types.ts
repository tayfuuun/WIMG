export interface FixItem {
  id: string;
  name: string;
  betrag: number;
  abbuchung: number;
  active?: boolean;
}

export interface FixCategory {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  active: boolean;
  type: 'expense' | 'income';
  scope?: 'privat' | 'geschaeftlich';
  items: FixItem[];
}

export interface IncomeGroup {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  active: boolean;
  type: 'income' | 'expense';
  scope?: 'privat' | 'geschaeftlich';
  items: FixItem[];
}

export type KreditCategory = 'ratenkredit' | 'konsum' | 'immobilie';

export interface Kredit {
  id: string;
  bemerkung: string;
  institut: string;
  name?: string; // Alternativer Anzeigename
  bank?: string; // Alternative Bankangabe
  notizen?: string; // Notizen / Details zur Zinsbindung etc.
  tilgungsart?: 'annuitaet' | 'endfaellig';
  isBausparer?: boolean;
  betrag: number;
  gesamtbetrag: number;
  zins: number;
  restbetrag: number;
  rate_monat?: number;
  kategorie?: KreditCategory;
  active?: boolean;
  link?: string;
  collapsed?: boolean;
  laufzeitJahre?: number;
  tilgung?: number;
  startMonat?: number;
  startJahr?: number;
  startDatum?: string;
  lastUpdateMonat?: number;
  lastUpdateJahr?: number;
  zinsbindungBis?: string; // Format YYYY-MM
  restschuldZinsende?: number; // Vorausberechnete Restschuld am Ende der Zinsbindung
  zuteilungDatum?: string; // Format YYYY-MM
}

export interface StromVerbrauch {
  jahr: number;
  kwh: number;
  zaehlerstand?: number;
}

export interface GasVerbrauch {
  jahr: number;
  wasser: number;
  heizung: number;
}

export interface EnergieDetail<T> {
  anbieter: string;
  zaehlernummer: string;
  kundennummer?: string;
  vertragsbeginn?: string;
  kuendigungsdatum?: string;
  loginUrl: string;
  abschlussDatum?: string;
  vertragslaufzeit: string;
  preisGarantie: string;
  kuendigungsfrist: string;
  angegebenerVerbrauch: number;
  arbeitspreis: number;
  grundpreis: number;
  abschlag: number;
  jahrespreis: number;
  collapsed?: boolean;
  historyCollapsed?: boolean;
  verbrauch: T[];
}

export interface EnergieData {
  strom: EnergieDetail<StromVerbrauch>;
  gas: EnergieDetail<GasVerbrauch>;
}

export interface LohnRecord {
  id: string;
  jahr: number;
  brutto_jahr: number;
  netto_monat: number;
  ereignis: string;
}

export interface KontoRecord {
  id: string;
  name: string;
  link: string;
  notiz: string;
  kategorie?: 'bank' | 'kredit' | 'depot' | 'krypto';
  username?: string;
  has2FA?: boolean;
  hasSecurityCodes?: boolean;
}

export type AssetKategorie = 'aktie' | 'etf' | 'krypto' | 'guthaben';

export interface PortfolioAsset {
  id: string;
  kategorie: AssetKategorie; // 'aktie', 'etf', 'krypto', 'guthaben'
  name: string; // e.g. "Bitcoin" or "Apple"
  kennung: string; // WKN, ISIN or Ticker symbol (e.g. "BTC", "US0378331005")
  anteile: number; // Number of shares/coins
  kaufpreisDurchschnitt: number; // Average purchase price in €
  kursAktuell: number; // Current market price in €
  notizen?: string; // Notizen / Depotbank
  letztesUpdate?: string; // ISO-Timestamp of last update
  autoUpdate: boolean; // Toggle for daily automatic updates
  active?: boolean; // Whether asset is included in calculations
  selected?: boolean; // Selection toggle for custom calculation inclusion
}

export type TabKey = 'cockpit' | 'finanzen' | 'kredite' | 'energie' | 'lohn' | 'konten' | 'fix' | 'portfolio';
export type Language = 'de' | 'en' | 'tr';

export interface DashboardData {
  fix: {
    categories: FixCategory[];
  };
  income: {
    groups: IncomeGroup[];
    expenseGroups: IncomeGroup[];
  };
  kredite: Kredit[];
  energie: EnergieData;
  lohn: LohnRecord[];
  konten: KontoRecord[];
  portfolio?: PortfolioAsset[];
  visibleTabs?: Record<TabKey, boolean>;
}
