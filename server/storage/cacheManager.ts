import { StockData, ApiUsageStats } from '../providers/types';
import { defaultWatchlist } from '../config/defaultWatchlist';
import { createStorageAdapter, StorageAdapter } from './storageAdapter';

// TTL em Milissegundos
const QUOTE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos
const FUNDAMENTALS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas (1 vez por dia)

export interface MarketParameters {
  bazinRateB3: number; // padrão 6.0%
  bazinRateUS: number; // padrão 3.5%
  grahamMultiplier: number; // padrão 22.5
  marginOfSafety: number; // padrão 20%
}

export class CacheManager {
  private adapter: StorageAdapter;
  private stocks: Map<string, StockData> = new Map();
  private stats: ApiUsageStats = {
    brapiRequestsToday: 0,
    fmpRequestsToday: 0,
    brapiLimit: 150,
    fmpLimit: 250,
    lastResetDate: new Date().toISOString().split('T')[0],
  };

  private marketParams: MarketParameters = {
    bazinRateB3: 6.0,
    bazinRateUS: 3.5,
    grahamMultiplier: 22.5,
    marginOfSafety: 20.0,
  };

  private initialized: boolean = false;

  constructor() {
    this.adapter = createStorageAdapter();
    // Inicia com a lista padrão imediatamente
    defaultWatchlist.forEach((s) => this.stocks.set(s.ticker.toUpperCase(), s));
  }

  public async init() {
    if (this.initialized) return;

    try {
      // Carrega stats
      const loadedStats = await this.adapter.loadStats();
      if (loadedStats) {
        const today = new Date().toISOString().split('T')[0];
        if (loadedStats.lastResetDate !== today) {
          this.stats = {
            ...loadedStats,
            brapiRequestsToday: 0,
            fmpRequestsToday: 0,
            lastResetDate: today,
          };
          await this.adapter.saveStats(this.stats);
        } else {
          this.stats = loadedStats;
        }
      }

      // Carrega params
      const loadedParams = await this.adapter.loadParams();
      if (loadedParams) {
        this.marketParams = loadedParams;
      }

      // Carrega stocks
      const loadedStocks = await this.adapter.loadStocks();
      if (loadedStocks && loadedStocks.length > 0) {
        this.stocks.clear();
        loadedStocks.forEach((s) => {
          if (s.isExampleData === undefined) {
            s.isExampleData = s.dataSource ? s.dataSource === 'EXEMPLO' : true;
          }
          if (!s.dataSource) {
            s.dataSource = 'EXEMPLO';
          }
          this.stocks.set(s.ticker.toUpperCase(), s);
        });
      }

      this.recalculateAllValuationsAndRankings();
      this.initialized = true;
    } catch (e) {
      console.error('[CacheManager] Erro na inicialização:', e);
    }
  }

  public getStorageType(): string {
    return this.adapter.type;
  }

  public getStats(): ApiUsageStats {
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastResetDate !== today) {
      this.stats.brapiRequestsToday = 0;
      this.stats.fmpRequestsToday = 0;
      this.stats.lastResetDate = today;
      this.adapter.saveStats(this.stats).catch(console.error);
    }
    return { ...this.stats };
  }

  public async incrementApiUsage(provider: 'brapi' | 'fmp', count: number = 1) {
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastResetDate !== today) {
      this.stats.brapiRequestsToday = 0;
      this.stats.fmpRequestsToday = 0;
      this.stats.lastResetDate = today;
    }

    if (provider === 'brapi') {
      this.stats.brapiRequestsToday += count;
    } else if (provider === 'fmp') {
      this.stats.fmpRequestsToday += count;
    }
    await this.adapter.saveStats(this.stats);
  }

  public getMarketParams(): MarketParameters {
    return { ...this.marketParams };
  }

  public async updateMarketParams(params: Partial<MarketParameters>) {
    this.marketParams = { ...this.marketParams, ...params };
    this.recalculateAllValuationsAndRankings();
    await this.adapter.saveParams(this.marketParams);
    await this.adapter.saveStocks(Array.from(this.stocks.values()));
  }

  public getAllStocks(): StockData[] {
    return Array.from(this.stocks.values());
  }

  public getStock(ticker: string): StockData | undefined {
    return this.stocks.get(ticker.toUpperCase());
  }

  public async addStock(stock: StockData): Promise<boolean> {
    const key = stock.ticker.toUpperCase();
    if (this.stocks.has(key)) return false;
    this.stocks.set(key, stock);
    this.recalculateAllValuationsAndRankings();
    await this.adapter.saveStocks(Array.from(this.stocks.values()));
    return true;
  }

  public async removeStock(ticker: string): Promise<boolean> {
    const key = ticker.toUpperCase();
    const deleted = this.stocks.delete(key);
    if (deleted) {
      this.recalculateAllValuationsAndRankings();
      await this.adapter.saveStocks(Array.from(this.stocks.values()));
    }
    return deleted;
  }

  public async updateStockData(ticker: string, updates: Partial<StockData>) {
    const key = ticker.toUpperCase();
    const existing = this.stocks.get(key);
    if (!existing) return;

    const merged = { ...existing, ...updates };
    this.stocks.set(key, merged);
    this.recalculateValuationForStock(merged);
    this.recalculateRankings();
    await this.adapter.saveStocks(Array.from(this.stocks.values()));
  }

  public async clearExampleStocks(): Promise<number> {
    const all = Array.from(this.stocks.values());
    let removedCount = 0;
    all.forEach((s) => {
      if (s.isExampleData) {
        this.stocks.delete(s.ticker.toUpperCase());
        removedCount++;
      }
    });
    if (removedCount > 0) {
      this.recalculateRankings();
      await this.adapter.saveStocks(Array.from(this.stocks.values()));
    }
    return removedCount;
  }

  public isQuoteStale(ticker: string): boolean {
    const stock = this.stocks.get(ticker.toUpperCase());
    if (!stock || !stock.quoteUpdatedAt) return true;
    const diff = Date.now() - new Date(stock.quoteUpdatedAt).getTime();
    return diff > QUOTE_CACHE_TTL_MS;
  }

  public isFundamentalsStale(ticker: string): boolean {
    const stock = this.stocks.get(ticker.toUpperCase());
    if (!stock || !stock.fundamentalsUpdatedAt) return true;
    const diff = Date.now() - new Date(stock.fundamentalsUpdatedAt).getTime();
    return diff > FUNDAMENTALS_CACHE_TTL_MS;
  }

  /**
   * Recalcula valuation individual de uma ação com base nas fórmulas
   */
  private recalculateValuationForStock(stock: StockData) {
    const isUS = stock.market === 'US';
    const bazinTargetYield = isUS
      ? this.marketParams.bazinRateUS
      : this.marketParams.bazinRateB3;
    const margin = this.marketParams.marginOfSafety / 100;
    const price = stock.price;

    // 1. BAZIN: DPA / (yield / 100)
    const effectiveDpa = stock.dpa ?? stock.dpa5yAvg ?? null;
    if (effectiveDpa !== null && effectiveDpa > 0 && bazinTargetYield > 0) {
      const ceiling = effectiveDpa / (bazinTargetYield / 100);
      stock.bazinCeiling = ceiling;
      stock.bazinBuyPrice = ceiling * (1 - margin);
      stock.bazinUpside =
        price && price > 0 ? ((ceiling - price) / price) * 100 : null;
    } else {
      stock.bazinCeiling = null;
      stock.bazinBuyPrice = null;
      stock.bazinUpside = null;
    }

    // 2. GRAHAM: sqrt(fator * LPA * VPA)
    // Regra estrita: Se LPA ou VPA <= 0: NÃO SE APLICA
    if (
      stock.lpa !== null &&
      stock.lpa > 0 &&
      stock.vpa !== null &&
      stock.vpa > 0 &&
      this.marketParams.grahamMultiplier > 0
    ) {
      stock.grahamApplicable = true;
      const product = this.marketParams.grahamMultiplier * stock.lpa * stock.vpa;
      const ceiling = Math.sqrt(product);
      stock.grahamCeiling = ceiling;
      stock.grahamBuyPrice = ceiling * (1 - margin);
      stock.grahamUpside =
        price && price > 0 ? ((ceiling - price) / price) * 100 : null;
    } else {
      stock.grahamApplicable = false;
      stock.grahamCeiling = null;
      stock.grahamBuyPrice = null;
      stock.grahamUpside = null;
    }

    // 3. PETER LYNCH: Teto = LPA * crescimento (%), Score = (crescimento + DY) / PE
    if (stock.lpa !== null && stock.lpa > 0 && stock.earningsGrowth && stock.earningsGrowth > 0) {
      const ceiling = stock.lpa * stock.earningsGrowth;
      stock.lynchCeiling = ceiling;
      stock.lynchBuyPrice = ceiling * (1 - margin);
      stock.lynchUpside =
        price && price > 0 ? ((ceiling - price) / price) * 100 : null;

      const pe = stock.peRatio ?? (price && price > 0 ? price / stock.lpa : null);
      if (pe && pe > 0) {
        stock.lynchPeg = pe / stock.earningsGrowth;
        const dy = stock.dividendYield ?? 0;
        stock.lynchScore = (stock.earningsGrowth + dy) / pe;
      } else {
        stock.lynchPeg = null;
        stock.lynchScore = null;
      }
    } else {
      stock.lynchCeiling = null;
      stock.lynchBuyPrice = null;
      stock.lynchUpside = null;
      stock.lynchPeg = null;
      stock.lynchScore = null;
    }

    // 4. GREENBLATT: EY = EBIT / EV; ROIC = EBIT / (Capital Giro + Imobilizado)
    if (stock.isFinancial) {
      stock.greenblattEy = null;
      stock.greenblattRoic = null;
    } else {
      const mktCap = stock.marketCap ?? (price && price > 0 ? price * 1000000 : null);
      const netDebt = stock.netDebt ?? 0;
      const ev = mktCap !== null ? mktCap + netDebt : null;

      if (stock.ebit !== null && stock.ebit > 0 && ev !== null && ev > 0) {
        stock.greenblattEy = (stock.ebit / ev) * 100;
      } else {
        stock.greenblattEy = null;
      }

      const capitalEmployed =
        (stock.netWorkingCapital ?? 0) + (stock.netFixedAssets ?? 0);
      if (stock.ebit !== null && stock.ebit > 0 && capitalEmployed > 0) {
        stock.greenblattRoic = (stock.ebit / capitalEmployed) * 100;
      } else {
        stock.greenblattRoic = stock.roic ?? null;
      }
    }

    // Upside de referência da ação
    stock.upside = stock.bazinUpside ?? stock.grahamUpside ?? stock.lynchUpside ?? null;
  }

  public recalculateAllValuationsAndRankings() {
    const list = Array.from(this.stocks.values());
    list.forEach((s) => this.recalculateValuationForStock(s));
    this.recalculateRankings();
  }

  private recalculateRankings() {
    const stocks = Array.from(this.stocks.values());

    // 1. Ranking Bazin
    const bazinSorted = [...stocks]
      .filter((s) => s.bazinUpside !== null && s.bazinUpside !== undefined)
      .sort((a, b) => (b.bazinUpside ?? -999) - (a.bazinUpside ?? -999));
    bazinSorted.forEach((s, idx) => {
      s.rankBazin = idx + 1;
    });

    // 2. Ranking Graham
    const grahamSorted = [...stocks]
      .filter((s) => s.grahamApplicable && s.grahamUpside !== null && s.grahamUpside !== undefined)
      .sort((a, b) => (b.grahamUpside ?? -999) - (a.grahamUpside ?? -999));
    grahamSorted.forEach((s, idx) => {
      s.rankGraham = idx + 1;
    });

    // 3. Ranking Peter Lynch
    const lynchSorted = [...stocks]
      .filter((s) => s.lynchScore !== null && s.lynchScore !== undefined)
      .sort((a, b) => (b.lynchScore ?? -999) - (a.lynchScore ?? -999));
    lynchSorted.forEach((s, idx) => {
      s.rankLynch = idx + 1;
    });

    // 4. Ranking Greenblatt
    const nonFinancials = stocks.filter(
      (s) =>
        !s.isFinancial &&
        s.greenblattEy !== null &&
        s.greenblattEy !== undefined &&
        s.greenblattRoic !== null &&
        s.greenblattRoic !== undefined
    );

    const byEy = [...nonFinancials].sort(
      (a, b) => (b.greenblattEy ?? -999) - (a.greenblattEy ?? -999)
    );
    byEy.forEach((s, idx) => {
      s.rankGreenblattEy = idx + 1;
    });

    const byRoic = [...nonFinancials].sort(
      (a, b) => (b.greenblattRoic ?? -999) - (a.greenblattRoic ?? -999)
    );
    byRoic.forEach((s, idx) => {
      s.rankGreenblattRoic = idx + 1;
    });

    nonFinancials.forEach((s) => {
      s.rankGreenblattSum = (s.rankGreenblattEy ?? 999) + (s.rankGreenblattRoic ?? 999);
    });

    const bySum = [...nonFinancials].sort(
      (a, b) => (a.rankGreenblattSum ?? 9999) - (b.rankGreenblattSum ?? 9999)
    );
    bySum.forEach((s, idx) => {
      s.rankGreenblatt = idx + 1;
    });

    stocks
      .filter((s) => s.isFinancial)
      .forEach((s) => {
        s.rankGreenblattEy = null;
        s.rankGreenblattRoic = null;
        s.rankGreenblattSum = null;
        s.rankGreenblatt = null;
      });

    // 5. Ranking Combinado
    stocks.forEach((s) => {
      const applicableRanks: number[] = [];
      if (s.rankBazin) applicableRanks.push(s.rankBazin);
      if (s.rankGraham) applicableRanks.push(s.rankGraham);
      if (s.rankLynch) applicableRanks.push(s.rankLynch);
      if (s.rankGreenblatt) applicableRanks.push(s.rankGreenblatt);

      if (applicableRanks.length >= 2) {
        const sum = applicableRanks.reduce((acc, r) => acc + r, 0);
        s.rankCombined = parseFloat((sum / applicableRanks.length).toFixed(1));
      } else if (applicableRanks.length === 1) {
        s.rankCombined = applicableRanks[0];
      } else {
        s.rankCombined = null;
      }
    });
  }
}

export const cacheManager = new CacheManager();
