export function parseNum(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  let s = String(value ?? '').trim().replace(/[^\d.,-]/g, '');
  if (!s) return 0;

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');

  if (lastDot > -1 && lastComma > -1) {
    if (lastDot > lastComma) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(/\./g, '').replace(',', '.');
    }
  } else if (lastComma > -1) {
    s = s.replace(',', '.');
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function fmtNumber(
  n: number | string | undefined | null,
  decimals = 2
): string {
  const val = parseNum(n);
  return val.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPercent(
  n: number | string | undefined | null,
  decimals = 1
): string {
  const val = parseNum(n);
  const formatted = val.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted}%`;
}

export function fmt(
  n: number | string | undefined | null
): string {
  const formattedNum = fmtNumber(n, 2);
  return `${formattedNum}\u00A0€`;
}

export function monthly(betrag: number, abbuchung: number): number {
  return (parseNum(betrag) * parseNum(abbuchung)) / 12;
}

export function generateId(prefix = 'item'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

export function getCurrencySymbol(): string {
  return '€';
}
