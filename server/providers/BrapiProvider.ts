import { StockDataProvider, StockData } from './types';
import { cacheManager } from '../storage/cacheManager';

export class BrapiProvider implements StockDataProvider {
  public id = 'brapi';
  public name = 'brapi.dev (B3 Oficial)';
  public market: 'B3' = 'B3';

  private getApiKey(): string | undefined {
    return process.env.BRAPI_API_KEY;
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 0;
  }

  public async getQuotes(tickers: string[]): Promise<Record<string, Partial<StockData>>> {
    const results: Record<string, Partial<StockData>> = {};
    if (tickers.length === 0) return results;

    const apiKey = this.getApiKey();
    const tokenParam = apiKey ? `&token=${apiKey}` : '';
    const tickersJoined = tickers.join(',');

    try {
      cacheManager.incrementApiUsage('brapi', 1);
      const url = `https://brapi.dev/api/quote/${tickersJoined}?fundamental=false${tokenParam}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        console.warn(`[BrapiProvider] HTTP ${response.status} ao buscar cotações para ${tickersJoined}`);
        return results;
      }

      const json = await response.json();
      if (json.results && Array.isArray(json.results)) {
        for (const item of json.results) {
          const ticker = item.symbol?.toUpperCase();
          if (ticker) {
            results[ticker] = {
              price: typeof item.regularMarketPrice === 'number' ? item.regularMarketPrice : null,
              changePercent: typeof item.regularMarketChangePercent === 'number' ? item.regularMarketChangePercent : null,
              volume: typeof item.regularMarketVolume === 'number' ? item.regularMarketVolume : null,
              marketCap: typeof item.marketCap === 'number' ? item.marketCap : null,
              quoteUpdatedAt: new Date().toISOString(),
              isExampleData: false,
              dataSource: 'BRAPI',
            };
          }
        }
      }
    } catch (e) {
      console.error('[BrapiProvider] Erro ao buscar cotações:', e);
    }

    return results;
  }

  public async getFundamentals(ticker: string): Promise<Partial<StockData> | null> {
    const apiKey = this.getApiKey();
    const tokenParam = apiKey ? `&token=${apiKey}` : '';

    try {
      cacheManager.incrementApiUsage('brapi', 1);
      const url = `https://brapi.dev/api/quote/${ticker}?fundamental=true&dividends=true${tokenParam}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        console.warn(`[BrapiProvider] HTTP ${response.status} ao buscar fundamentos para ${ticker}`);
        return null;
      }

      const json = await response.json();
      const item = json.results?.[0];
      if (!item) return null;

      const summary = item.summaryProfile || {};
      const financial = item.financialData || {};
      const stats = item.defaultKeyStatistics || {};

      // Parse proventos
      let dpa: number | null = null;
      if (item.dividendsData?.cashDividends && Array.isArray(item.dividendsData.cashDividends)) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const recentDividends = item.dividendsData.cashDividends.filter(
          (d: any) => new Date(d.paymentDate || d.approvedOn) >= oneYearAgo
        );
        if (recentDividends.length > 0) {
          dpa = recentDividends.reduce((acc: number, d: any) => acc + (Number(d.rate) || 0), 0);
        }
      }

      const lpa = typeof stats.trailingEps === 'number' ? stats.trailingEps : null;
      const vpa = typeof stats.bookValue === 'number' ? stats.bookValue : null;
      const peRatio = typeof stats.trailingPE === 'number' ? stats.trailingPE : null;
      const pvpRatio = typeof stats.priceToBook === 'number' ? stats.priceToBook : null;
      const roe = typeof financial.returnOnEquity === 'number' ? financial.returnOnEquity * 100 : null;

      return {
        name: item.longName || item.shortName,
        sector: summary.sector || summary.industry,
        price: typeof item.regularMarketPrice === 'number' ? item.regularMarketPrice : null,
        changePercent: typeof item.regularMarketChangePercent === 'number' ? item.regularMarketChangePercent : null,
        marketCap: typeof item.marketCap === 'number' ? item.marketCap : null,
        volume: typeof item.regularMarketVolume === 'number' ? item.regularMarketVolume : null,
        lpa,
        vpa,
        dpa: dpa ?? (typeof stats.trailingAnnualDividendRate === 'number' ? stats.trailingAnnualDividendRate : null),
        peRatio,
        pvpRatio,
        roe,
        quoteUpdatedAt: new Date().toISOString(),
        fundamentalsUpdatedAt: new Date().toISOString(),
        isExampleData: false,
        dataSource: 'BRAPI',
      };
    } catch (e) {
      console.error(`[BrapiProvider] Erro ao buscar fundamentos de ${ticker}:`, e);
      return null;
    }
  }
}
