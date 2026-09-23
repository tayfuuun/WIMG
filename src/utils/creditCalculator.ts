import { Kredit } from '../types';

/**
 * Calculates elapsed months from a given start month and year to asOfDate.
 */
export function getElapsedMonths(
  startJahr?: number,
  startMonat?: number,
  asOfDate: Date = new Date()
): number {
  if (!startJahr || !startMonat) return 0;
  const currentYear = asOfDate.getFullYear();
  const currentMonth = asOfDate.getMonth() + 1; // 1-12
  const elapsed = (currentYear - startJahr) * 12 + (currentMonth - startMonat);
  return Math.max(0, elapsed);
}

/**
 * Calculates current remaining debt (Restschuld) based on start date, loan amount, interest rate and monthly payment.
 * Employs standard monthly bank amortization (Annuitätentilgung).
 */
export function calculateCurrentRestDebt(
  kredit: Partial<Kredit>,
  asOfDate: Date = new Date()
): number {
  const baseRest =
    kredit.restbetrag !== undefined && kredit.restbetrag !== null
      ? Number(kredit.restbetrag)
      : Number(kredit.betrag) || 0;

  if (baseRest <= 0) return 0;

  // 1. Endfälliges Darlehen: Restschuld bleibt immer gleich dem Ursprungsbetrag
  if (kredit.tilgungsart === 'endfaellig') {
    return baseRest;
  }

  const rate = Number(kredit.rate_monat) || 0;

  let startYear = kredit.startJahr;
  let startMonth = kredit.startMonat;

  if (!startYear || !startMonth) {
    if (kredit.startDatum) {
      const parts = kredit.startDatum.split('-');
      if (parts.length >= 2) {
        startYear = parseInt(parts[0], 10);
        startMonth = parseInt(parts[1], 10);
      }
    }
  }

  if (!startYear || !startMonth || rate <= 0) {
    return baseRest;
  }

  const elapsed = getElapsedMonths(startYear, startMonth, asOfDate);
  if (elapsed <= 0) {
    return baseRest;
  }

  // 2. Bausparvertrag (Guthaben): Guthaben wächst monatlich um die Einzahlungsrate
  if (kredit.isBausparer) {
    return Math.round((baseRest + elapsed * rate) * 100) / 100;
  }

  // 3. Standard-Kredit (Ratenkredit & Immobilienkredit):
  // Die Restschuld verringert sich jeden Monat automatisch um die monatliche Rate
  const current = baseRest - elapsed * rate;
  return Math.max(0, Math.round(current * 100) / 100);
}

/**
 * Computes monthly payment (Abtrag) given netto, zins, laufzeit in years, and optional tilgungsrate.
 */
export function calculateMonthlyRate(
  netto: number,
  zins: number,
  laufzeitJahre: number,
  tilgung?: number,
  tilgungsart?: 'annuitaet' | 'endfaellig'
): number {
  if (netto <= 0) return 0;

  // Bei endfälligen Krediten besteht die Rate nur aus Zinsen (keine Tilgung)
  if (tilgungsart === 'endfaellig') {
    const monthlyInterest = (netto * (zins / 100)) / 12;
    return Math.round(monthlyInterest * 100) / 100;
  }

  if (tilgung !== undefined && tilgung > 0) {
    // German standard initial repayment formula: Annuität = Netto * (Zins% + Tilgung%) / 100
    const annualRate = (netto * (zins + tilgung)) / 100;
    return Math.round((annualRate / 12) * 100) / 100;
  }

  if (laufzeitJahre > 0) {
    const months = laufzeitJahre * 12;
    const r = (zins / 100) / 12;
    if (r > 0) {
      const factor = Math.pow(1 + r, months);
      const monthly = (netto * r * factor) / (factor - 1);
      return Math.round(monthly * 100) / 100;
    } else {
      return Math.round((netto / months) * 100) / 100;
    }
  }

  return 0;
}

/**
 * Computes total repayment sum (Gesamtbetrag inklusive Zinsen und Gebühren).
 */
export function calculateTotalAmount(rate: number, laufzeitJahre: number): number {
  if (rate <= 0 || laufzeitJahre <= 0) return 0;
  return Math.round(rate * (laufzeitJahre * 12) * 100) / 100;
}

/**
 * Computes initial annual repayment rate (Tilgung in % p.a.) from monthly payment.
 */
export function calculateTilgungsrate(netto: number, zins: number, monthlyRate: number): number {
  if (netto <= 0 || monthlyRate <= 0) return 0;
  const annualPayment = monthlyRate * 12;
  const ratePercent = (annualPayment / netto) * 100;
  const tilgung = Math.max(0, ratePercent - zins);
  return Math.round(tilgung * 100) / 100;
}

export interface AmortizationSimulationResult {
  months: number;
  totalInterest: number;
  targetDate: Date | null;
  dateDisplay: string;
  durationBadge: string;
}

const GERMAN_MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/**
 * Simulates month-by-month multi-loan amortization with optional extra monthly repayment (Sondertilgung).
 * Allocates extra payments to the loan with the highest interest rate (Avalanche method) to maximize savings.
 */
export function simulateLoanAmortization(
  loans: Partial<Kredit>[],
  extraMonthly: number = 0,
  asOfDate: Date = new Date()
): AmortizationSimulationResult {
  // Bausparer ist Guthaben und keine Schuld - wird in der Schuldenfrei-Simulation nicht als Schuld getilgt
  const activeLoans = loans
    .filter((l) => l.active !== false && !l.isBausparer)
    .map((l) => {
      const rest = Number(l.restbetrag);
      const balance = !isNaN(rest) && rest > 0 ? rest : Number(l.betrag) || 0;
      let rate = Number(l.rate_monat) || 0;
      const zins = Number(l.zins) || 0;
      const laufzeit = Number(l.laufzeitJahre) || 5;
      const isEndfaellig = l.tilgungsart === 'endfaellig';

      if (rate <= 0 && balance > 0) {
        rate = calculateMonthlyRate(balance, zins, laufzeit, undefined, l.tilgungsart);
      }
      // Für Annuitätendarlehen: Mindesttilgung sicherstellen
      if (!isEndfaellig) {
        const monthlyInterest = balance * ((zins / 100) / 12);
        if (rate <= monthlyInterest) {
          rate = monthlyInterest + (balance * 0.01) / 12;
        }
      }

      return {
        id: l.id || '',
        balance,
        rate: Math.max(1, rate),
        zins,
        isEndfaellig,
        laufzeitJahre: laufzeit,
        startJahr: l.startJahr,
        startMonat: l.startMonat,
      };
    })
    .filter((l) => l.balance > 0.01);

  if (activeLoans.length === 0) {
    return {
      months: 0,
      totalInterest: 0,
      targetDate: asOfDate,
      dateDisplay: 'Schuldenfrei',
      durationBadge: 'Keine Restschuld',
    };
  }

  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 years max cap

  // Deep clone loan balances for simulation
  const balances = activeLoans.map((l) => ({ ...l }));

  while (months < maxMonths && balances.some((b) => b.balance > 0.5)) {
    months++;
    // Sort highest zins first for optimal extra payment impact
    balances.sort((a, b) => b.zins - a.zins);

    // 1. Regular monthly payments
    for (const b of balances) {
      if (b.balance <= 0) continue;
      const monthlyInterest = b.balance * ((b.zins / 100) / 12);
      totalInterest += monthlyInterest;
      
      if (b.isEndfaellig) {
        // Endfälliges Darlehen: Tilgung erfolgt am Ende der Laufzeit (z.B. durch Ablösung/Bausparer)
        const startTotalMonths = (b.startJahr && b.startMonat) 
          ? (b.startJahr * 12 + b.startMonat - 1) 
          : (asOfDate.getFullYear() * 12 + asOfDate.getMonth());
        const curSimMonth = (asOfDate.getFullYear() * 12 + asOfDate.getMonth()) + months;
        const maturityMonth = startTotalMonths + Math.round(b.laufzeitJahre * 12);
        
        if (curSimMonth >= maturityMonth) {
          b.balance = 0; // Am Laufzeitende abgelöst
        }
      } else {
        const principal = Math.min(b.balance, Math.max(0, b.rate - monthlyInterest));
        b.balance -= principal;
      }
    }

    // 2. Extra monthly payment (Sondertilgung)
    let remainingExtra = Math.max(0, extraMonthly);
    for (const b of balances) {
      if (remainingExtra <= 0) break;
      if (b.balance <= 0) continue;
      const extraPrincipal = Math.min(b.balance, remainingExtra);
      b.balance -= extraPrincipal;
      remainingExtra -= extraPrincipal;
    }
  }

  const targetDate = new Date(asOfDate.getFullYear(), asOfDate.getMonth() + months, 1);
  const dateDisplay = `${GERMAN_MONTH_NAMES[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  let durationBadge = '';
  if (years > 0 && remMonths > 0) {
    durationBadge = `in ${years} ${years === 1 ? 'Jahr' : 'Jahren'}, ${remMonths} ${remMonths === 1 ? 'Monat' : 'Monaten'}`;
  } else if (years > 0) {
    durationBadge = `in ${years} ${years === 1 ? 'Jahr' : 'Jahren'}`;
  } else if (remMonths > 0) {
    durationBadge = `in ${remMonths} ${remMonths === 1 ? 'Monat' : 'Monaten'}`;
  } else {
    durationBadge = 'Diesen Monat';
  }

  return {
    months,
    totalInterest: Math.round(totalInterest),
    targetDate,
    dateDisplay,
    durationBadge,
  };
}

/**
 * Formats difference in months to human-readable string (e.g. "2 Jahre früher schuldenfrei").
 */
export function formatMonthDifference(diffMonths: number): string {
  if (diffMonths <= 0) return '';
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  if (years > 0 && months > 0) {
    return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}, ${months} ${months === 1 ? 'Monat' : 'Monate'} früher`;
  }
  if (years > 0) {
    return `${years} ${years === 1 ? 'Jahr' : 'Jahre'} früher`;
  }
  return `${months} ${months === 1 ? 'Monat' : 'Monate'} früher`;
}

