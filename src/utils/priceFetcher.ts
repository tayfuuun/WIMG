import { PortfolioAsset } from '../types';

/**
 * Known baseline market prices in EUR for accurate fallback
 */
const KNOWN_BASELINES: Record<string, number> = {
  // Alphabet A (US02079K3059)
  US02079K3059: 307.18,
  GOOGL: 307.18,
  ALPHABET: 307.18,

  // NVIDIA (US67066G1040)
  US67066G1040: 199.65,
  NVDA: 199.65,
  NVIDIA: 199.65,

  // iShares Nasdaq 100 (IE00B53SZB19)
  IE00B53SZB19: 1544.40,
  NASDAQ: 1544.40,
  SXRV: 1544.40,

  // Apple Inc (ISIN US0378331005)
  US0378331005: 295.40,
  AAPL: 295.40,
  'APC.DE': 295.40,

  // Bitcoin & Ethereum
  BTC: 74476.88,
  ETH: 2375.82,

  // Cash / Tagesgeld
  'CASH-RESERVE': 1.0,
  GUTHABEN: 1.0,
};

/**
 * Maps asset identifier (WKN, ISIN, Ticker, Name) to live API parameters
 */
function resolveTickerSymbol(asset: PortfolioAsset): {
  type: 'crypto' | 'stock' | 'fixed';
  symbol: string;
  fallbackPrice: number;
} {
  const normKennung = (asset.kennung || '').trim().toUpperCase();
  const normName = (asset.name || '').trim().toUpperCase();
  const kat = asset.kategorie;

  if (kat === 'guthaben') {
    return { type: 'fixed', symbol: 'CASH', fallbackPrice: 1.0 };
  }

  // Check Crypto
  if (
    normKennung === 'BTC' ||
    normName.includes('BITCOIN') ||
    (kat === 'krypto' && (normName.includes('BTC') || normKennung === 'BTC'))
  ) {
    return { type: 'crypto', symbol: 'BTCEUR', fallbackPrice: asset.kursAktuell || 74476.88 };
  }

  if (
    normKennung === 'ETH' ||
    normName.includes('ETHEREUM') ||
    (kat === 'krypto' && (normName.includes('ETH') || normKennung === 'ETH'))
  ) {
    return { type: 'crypto', symbol: 'ETHEUR', fallbackPrice: asset.kursAktuell || 2375.82 };
  }

  // Alphabet A
  if (
    normKennung === 'US02079K3059' ||
    normKennung === 'GOOGL' ||
    normName.includes('ALPHABET')
  ) {
    return { type: 'stock', symbol: 'ABEA.DE', fallbackPrice: asset.kursAktuell || 307.18 };
  }

  // NVIDIA
  if (
    normKennung === 'US67066G1040' ||
    normKennung === 'NVDA' ||
    normName.includes('NVIDIA')
  ) {
    return { type: 'stock', symbol: 'NVD.DE', fallbackPrice: asset.kursAktuell || 199.65 };
  }

  // Nasdaq 100
  if (
    normKennung === 'IE00B53SZB19' ||
    normKennung === 'SXRV' ||
    normName.includes('NASDAQ')
  ) {
    return { type: 'stock', symbol: 'SXRV.DE', fallbackPrice: asset.kursAktuell || 1544.40 };
  }

  // Apple
  if (
    normKennung === 'US0378331005' ||
    normKennung === '865985' ||
    normKennung === 'AAPL' ||
    normName.includes('APPLE')
  ) {
    return { type: 'stock', symbol: 'APC.DE', fallbackPrice: asset.kursAktuell || 295.40 };
  }

  // Other Cryptos
  if (kat === 'krypto' && /^[A-Z0-9]{2,10}$/.test(normKennung)) {
    return { type: 'crypto', symbol: `${normKennung}EUR`, fallbackPrice: asset.kursAktuell || 100.0 };
  }

  const defaultPrice = asset.kursAktuell || KNOWN_BASELINES[normKennung] || KNOWN_BASELINES[normName] || 100.0;
  const symbolToQuery = normKennung || 'UNKNOWN';
  return { type: 'stock', symbol: symbolToQuery, fallbackPrice: defaultPrice };
}

/**
 * Fetch live quote for crypto via Binance API
 */
async function fetchCryptoPrice(symbol: string, fallback: number): Promise<number> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.price) {
        const parsed = parseFloat(data.price);
        if (!isNaN(parsed) && parsed > 0) {
          return Number(parsed.toFixed(2));
        }
      }
    }
  } catch (e) {
    console.warn(`Could not fetch live crypto price for ${symbol}, using fallback`, e);
  }
  return fallback;
}

/**
 * Fetch live quote for stock/ETF via Yahoo Finance API with automatic ISIN lookup
 */
async function fetchStockPrice(symbolOrIsin: string, fallback: number): Promise<number> {
  if (!symbolOrIsin || symbolOrIsin === 'UNKNOWN') return fallback;

  let querySymbol = symbolOrIsin;

  // If input looks like an ISIN (12 alphanumeric characters starting with 2 letters)
  if (/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(symbolOrIsin)) {
    try {
      const searchRes = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${symbolOrIsin}&quotesCount=5`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const quotes = searchData?.quotes || [];
        if (quotes.length > 0) {
          // Prefer German exchanges (.DE or .F) if available for EUR price
          const eurQuote = quotes.find(
            (q: any) => q.symbol && (q.symbol.endsWith('.DE') || q.symbol.endsWith('.F'))
          );
          querySymbol = eurQuote ? eurQuote.symbol : quotes[0].symbol;
        }
      }
    } catch (e) {
      console.warn(`ISIN search failed for ${symbolOrIsin}, trying direct query`, e);
    }
  }

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${querySymbol}?interval=1d`);
    if (res.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && typeof price === 'number' && price > 0) {
        return Number(price.toFixed(2));
      }
    }
  } catch (e) {
    console.warn(`Could not fetch live stock price for ${querySymbol}, using fallback`, e);
  }

  return fallback;
}

/**
 * Batch update asset prices with real live market rates or accurate baselines
 */
export async function updateAssetPrices(assets: PortfolioAsset[]): Promise<PortfolioAsset[]> {
  const updatedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (asset.active === false) return asset;

      // If autoUpdate is disabled, keep current manually entered price
      if (asset.autoUpdate === false) {
        return asset;
      }

      const { type, symbol, fallbackPrice } = resolveTickerSymbol(asset);

      let newPrice = fallbackPrice;

      if (type === 'crypto') {
        newPrice = await fetchCryptoPrice(symbol, fallbackPrice);
      } else if (type === 'stock') {
        newPrice = await fetchStockPrice(symbol, fallbackPrice);
      } else if (type === 'fixed') {
        newPrice = 1.0;
      }

      const finalPrice = newPrice > 0 ? newPrice : asset.kursAktuell;

      return {
        ...asset,
        kursAktuell: finalPrice,
        letztesUpdate: new Date().toISOString(),
      };
    })
  );

  return updatedAssets;
}
