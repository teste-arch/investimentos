import { StockDataProvider, StockData } from './types';
import { cacheManager } from '../storage/cacheManager';

export class FmpProvider implements StockDataProvider {
  public id = 'fmp';
  public name = 'Financial Modeling Prep (EUA)';
  public market: 'US' = 'US';

  private getApiKey(): string | undefined {
    return process.env.FMP_API_KEY;
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 0;
  }

  public async getQuotes(tickers: string[]): Promise<Record<string, Partial<StockData>>> {
    const results: Record<string, Partial<StockData>> = {};
    if (tickers.length === 0) return results;

    const apiKey = this.getApiKey();
    if (!apiKey) return results;

    const tickersJoined = tickers.join(',');

    try {
      cacheManager.incrementApiUsage('fmp', 1);
      const url = `https://financialmodelingprep.com/api/v3/quote/${tickersJoined}?apikey=${apiKey}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!response.ok) {
        console.warn(`[FmpProvider] HTTP ${response.status} ao buscar cotações para ${tickersJoined}`);
        return results;
      }

      const list = await response.json();
      if (Array.isArray(list)) {
        for (const item of list) {
          const ticker = item.symbol?.toUpperCase();
          if (ticker) {
            results[ticker] = {
              price: typeof item.price === 'number' ? item.price : null,
              changePercent: typeof item.changesPercentage === 'number' ? item.changesPercentage : null,
              volume: typeof item.volume === 'number' ? item.volume : null,
              marketCap: typeof item.marketCap === 'number' ? item.marketCap : null,
              lpa: typeof item.eps === 'number' ? item.eps : null,
              peRatio: typeof item.pe === 'number' ? item.pe : null,
              quoteUpdatedAt: new Date().toISOString(),
              isExampleData: false,
              dataSource: 'FMP',
            };
          }
        }
      }
    } catch (e) {
      console.error('[FmpProvider] Erro ao buscar cotações:', e);
    }

    return results;
  }

  public async getFundamentals(ticker: string): Promise<Partial<StockData> | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      cacheManager.incrementApiUsage('fmp', 1);
      const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`;
      const ratiosUrl = `https://financialmodelingprep.com/api/v3/ratios-ttm/${ticker}?apikey=${apiKey}`;

      const [profileRes, ratiosRes] = await Promise.all([
        fetch(profileUrl),
        fetch(ratiosUrl),
      ]);

      const profileList = profileRes.ok ? await profileRes.json() : [];
      const ratiosList = ratiosRes.ok ? await ratiosRes.json() : [];

      const profile = Array.isArray(profileList) ? profileList[0] : null;
      const ratios = Array.isArray(ratiosList) ? ratiosList[0] : null;

      if (!profile && !ratios) return null;

      const isFinancial =
        profile?.sector?.toLowerCase().includes('financial') ||
        profile?.industry?.toLowerCase().includes('bank') ||
        false;

      return {
        name: profile?.companyName,
        sector: profile?.sector,
        price: typeof profile?.price === 'number' ? profile.price : null,
        changePercent: typeof profile?.changes === 'number' ? profile.changes : null,
        marketCap: typeof profile?.mktCap === 'number' ? profile.mktCap : null,
        isFinancial,
        dpa: typeof profile?.lastDiv === 'number' ? profile.lastDiv : null,
        dividendYield: typeof ratios?.dividendYieldTTM === 'number' ? ratios.dividendYieldTTM * 100 : null,
        peRatio: typeof ratios?.peRatioTTM === 'number' ? ratios.peRatioTTM : null,
        pvpRatio: typeof ratios?.priceToBookRatioTTM === 'number' ? ratios.priceToBookRatioTTM : null,
        roe: typeof ratios?.returnOnEquityTTM === 'number' ? ratios.returnOnEquityTTM * 100 : null,
        roic: typeof ratios?.returnOnCapitalEmployedTTM === 'number' ? ratios.returnOnCapitalEmployedTTM * 100 : null,
        quoteUpdatedAt: new Date().toISOString(),
        fundamentalsUpdatedAt: new Date().toISOString(),
        isExampleData: false,
        dataSource: 'FMP',
      };
    } catch (e) {
      console.error(`[FmpProvider] Erro ao buscar fundamentos de ${ticker}:`, e);
      return null;
    }
  }
}
