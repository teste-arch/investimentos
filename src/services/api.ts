import type { MarketType, Currency } from '../../server/providers/types';

export interface ApiStockItem {
  ticker: string;
  name: string;
  sector: string;
  market: MarketType;
  currency: Currency;
  isFinancial: boolean;
  isExampleData: boolean;
  dataSource?: 'EXEMPLO' | 'BRAPI' | 'FMP' | 'MANUAL';

  price: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  avgDailyLiquidity: number | null;
  quoteUpdatedAt: string | null;

  lpa: number | null;
  vpa: number | null;
  dpa: number | null;
  dpa5yAvg: number | null;
  peRatio: number | null;
  pvpRatio: number | null;
  dividendYield: number | null;
  roe: number | null;
  roic: number | null;
  dlEbitda: number | null;
  ebit: number | null;
  netDebt: number | null;
  netWorkingCapital: number | null;
  netFixedAssets: number | null;
  earningsGrowth: number | null;
  fundamentalsUpdatedAt: string | null;

  bazinCeiling: number | null;
  bazinBuyPrice: number | null;
  bazinUpside: number | null;

  grahamCeiling: number | null;
  grahamBuyPrice: number | null;
  grahamUpside: number | null;
  grahamApplicable: boolean;

  lynchCeiling: number | null;
  lynchBuyPrice: number | null;
  lynchScore: number | null;
  lynchPeg: number | null;
  lynchUpside: number | null;

  greenblattEy: number | null;
  greenblattRoic: number | null;

  rankBazin?: number | null;
  rankGraham?: number | null;
  rankLynch?: number | null;
  rankGreenblattEy?: number | null;
  rankGreenblattRoic?: number | null;
  rankGreenblattSum?: number | null;
  rankGreenblatt?: number | null;
  rankCombined?: number | null;

  upside?: number | null;
}

export interface ApiUsageStats {
  brapiRequestsToday: number;
  fmpRequestsToday: number;
  brapiLimit: number;
  fmpLimit: number;
  lastResetDate: string;
}

export interface MarketParameters {
  bazinRateB3: number;
  bazinRateUS: number;
  grahamMultiplier: number;
  marginOfSafety: number;
}

export interface StocksResponse {
  success: boolean;
  count: number;
  data: ApiStockItem[];
  stats: ApiUsageStats;
  marketParams: MarketParameters;
  lastUpdated: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  market: MarketType;
  isConfigured: boolean;
  isActive: boolean;
}

export async function fetchStocks(params: {
  market?: string;
  ranking?: string;
  search?: string;
  minPe?: number | '';
  maxPe?: number | '';
  maxDlEbitda?: number | '';
  minRoe?: number | '';
  minLiquidity?: number | '';
  excludeFinancials?: boolean;
}): Promise<StocksResponse> {
  const query = new URLSearchParams();
  if (params.market) query.set('market', params.market);
  if (params.ranking) query.set('ranking', params.ranking);
  if (params.search) query.set('search', params.search);
  if (params.minPe !== undefined && params.minPe !== '') query.set('minPe', String(params.minPe));
  if (params.maxPe !== undefined && params.maxPe !== '') query.set('maxPe', String(params.maxPe));
  if (params.maxDlEbitda !== undefined && params.maxDlEbitda !== '')
    query.set('maxDlEbitda', String(params.maxDlEbitda));
  if (params.minRoe !== undefined && params.minRoe !== '') query.set('minRoe', String(params.minRoe));
  if (params.minLiquidity !== undefined && params.minLiquidity !== '')
    query.set('minLiquidity', String(params.minLiquidity));
  if (params.excludeFinancials) query.set('excludeFinancials', 'true');

  const res = await fetch(`/api/stocks?${query.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function refreshAllStocks(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/stocks/refresh-all', { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function refreshTicker(ticker: string): Promise<{ success: boolean; message: string; stock: ApiStockItem }> {
  const res = await fetch(`/api/stocks/refresh-ticker/${ticker}`, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addWatchlistTicker(payload: {
  ticker: string;
  name?: string;
  market: MarketType;
  isFinancial?: boolean;
  price?: number;
  lpa?: number;
  vpa?: number;
  dpa?: number;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/stocks/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Falha ao adicionar ticker' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function removeWatchlistTicker(ticker: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/stocks/watchlist/${ticker}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateMarketParams(params: Partial<MarketParameters>): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/stocks/params', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchProviders(): Promise<{
  success: boolean;
  providers: ProviderItem[];
  stats: ApiUsageStats;
}> {
  const res = await fetch('/api/stocks/providers');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function clearExampleStocks(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/stocks/clear-examples', { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function checkAuthStatus(): Promise<{ success: boolean; isProtected: boolean }> {
  try {
    const res = await fetch('/api/auth/status');
    if (!res.ok) return { success: true, isProtected: false };
    return res.json();
  } catch {
    return { success: true, isProtected: false };
  }
}

export async function loginSite(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Senha incorreta.');
  }
  return data;
}
