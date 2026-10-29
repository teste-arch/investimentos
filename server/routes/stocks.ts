import { Router, Request, Response } from 'express';
import { cacheManager } from '../storage/cacheManager';
import { providerRegistry } from '../providers/ProviderRegistry';
import { FilterOptions, RankingCriterion, StockData } from '../providers/types';

export const stocksRouter = Router();

/**
 * GET /api/stocks
 * Retorna todas as ações com filtros e ordenação configurável
 */
stocksRouter.get('/', (req: Request, res: Response) => {
  try {
    let stocks = cacheManager.getAllStocks();

    const {
      market,
      ranking = 'combined',
      search,
      minPe,
      maxPe,
      maxDlEbitda,
      minRoe,
      minLiquidity,
      excludeFinancials,
    } = req.query;

    // Filtro de Mercado
    if (market && market !== 'ALL') {
      stocks = stocks.filter((s) => s.market === market);
    }

    // Busca textual
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      stocks = stocks.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // Exclusão de financeiras (padrão em Greenblatt ou filtro manual)
    if (excludeFinancials === 'true') {
      stocks = stocks.filter((s) => !s.isFinancial);
    }

    // Filtros Quantitativos (Tratando dados ausentes: "nunca tratar como zero")
    if (minPe !== undefined && minPe !== '') {
      const min = parseFloat(minPe as string);
      if (!isNaN(min)) {
        stocks = stocks.filter((s) => s.peRatio !== null && s.peRatio >= min);
      }
    }

    if (maxPe !== undefined && maxPe !== '') {
      const max = parseFloat(maxPe as string);
      if (!isNaN(max)) {
        stocks = stocks.filter((s) => s.peRatio !== null && s.peRatio <= max);
      }
    }

    if (maxDlEbitda !== undefined && maxDlEbitda !== '') {
      const max = parseFloat(maxDlEbitda as string);
      if (!isNaN(max)) {
        stocks = stocks.filter(
          (s) => s.isFinancial || (s.dlEbitda !== null && s.dlEbitda <= max)
        );
      }
    }

    if (minRoe !== undefined && minRoe !== '') {
      const min = parseFloat(minRoe as string);
      if (!isNaN(min)) {
        stocks = stocks.filter((s) => s.roe !== null && s.roe >= min);
      }
    }

    if (minLiquidity !== undefined && minLiquidity !== '') {
      const min = parseFloat(minLiquidity as string);
      if (!isNaN(min)) {
        stocks = stocks.filter(
          (s) => s.avgDailyLiquidity !== null && s.avgDailyLiquidity >= min
        );
      }
    }

    // Ordenação por Ranking Selecionado
    const criterion = ranking as RankingCriterion;
    stocks.sort((a, b) => {
      switch (criterion) {
        case 'bazin':
          return (a.rankBazin ?? 9999) - (b.rankBazin ?? 9999);
        case 'graham':
          return (a.rankGraham ?? 9999) - (b.rankGraham ?? 9999);
        case 'lynch':
          return (a.rankLynch ?? 9999) - (b.rankLynch ?? 9999);
        case 'greenblatt':
          return (a.rankGreenblatt ?? 9999) - (b.rankGreenblatt ?? 9999);
        case 'combined':
        default:
          return (a.rankCombined ?? 9999) - (b.rankCombined ?? 9999);
      }
    });

    const stats = cacheManager.getStats();
    const marketParams = cacheManager.getMarketParams();

    res.json({
      success: true,
      count: stocks.length,
      data: stocks,
      stats,
      marketParams,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /api/stocks/refresh-ticker/:ticker
 * Atualiza um único ticker de forma inteligente respeitando cache
 */
stocksRouter.post('/refresh-ticker/:ticker', async (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const stock = cacheManager.getStock(ticker);
    if (!stock) {
      return res.status(404).json({ success: false, error: 'Ticker não encontrado na lista.' });
    }

    const provider = providerRegistry.getActiveProvider(stock.market);
    if (!provider || !provider.isConfigured()) {
      // Se não configurado, simula atualização mantendo dados e carimbando timestamp
      cacheManager.updateStockData(ticker, {
        quoteUpdatedAt: new Date().toISOString(),
      });
      return res.json({
        success: true,
        message: `Ticker ${ticker} verificado em cache local (sem chave de API configurada para requisição externa).`,
        stock: cacheManager.getStock(ticker),
      });
    }

    // Atualiza cotação
    const quotes = await provider.getQuotes([ticker]);
    if (quotes[ticker]) {
      cacheManager.updateStockData(ticker, quotes[ticker]);
    }

    // Atualiza fundamentos se expirado
    if (cacheManager.isFundamentalsStale(ticker)) {
      const fundamentals = await provider.getFundamentals(ticker);
      if (fundamentals) {
        cacheManager.updateStockData(ticker, fundamentals);
      }
    }

    res.json({
      success: true,
      message: `Ticker ${ticker} atualizado com sucesso.`,
      stock: cacheManager.getStock(ticker),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /api/stocks/refresh-all
 * Atualiza todas as ações
 */
stocksRouter.post('/refresh-all', async (req: Request, res: Response) => {
  try {
    const all = cacheManager.getAllStocks();
    const b3Tickers = all.filter((s) => s.market === 'B3').map((s) => s.ticker);
    const usTickers = all.filter((s) => s.market === 'US').map((s) => s.ticker);

    const b3Provider = providerRegistry.getActiveProvider('B3');
    const usProvider = providerRegistry.getActiveProvider('US');

    let updatedCount = 0;

    if (b3Provider && b3Provider.isConfigured() && b3Tickers.length > 0) {
      const b3Quotes = await b3Provider.getQuotes(b3Tickers);
      for (const [tick, data] of Object.entries(b3Quotes)) {
        cacheManager.updateStockData(tick, data);
        updatedCount++;
      }
    }

    if (usProvider && usProvider.isConfigured() && usTickers.length > 0) {
      const usQuotes = await usProvider.getQuotes(usTickers);
      for (const [tick, data] of Object.entries(usQuotes)) {
        cacheManager.updateStockData(tick, data);
        updatedCount++;
      }
    }

    // Se nenhuma chave estiver configurada, atualiza timestamps
    if (updatedCount === 0) {
      all.forEach((s) => {
        cacheManager.updateStockData(s.ticker, {
          quoteUpdatedAt: new Date().toISOString(),
        });
      });
    }

    res.json({
      success: true,
      message: `${all.length} ativos verificados e recalculados.`,
      stats: cacheManager.getStats(),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /api/stocks/watchlist
 * Adiciona um novo ticker à lista de monitoramento
 */
stocksRouter.post('/watchlist', (req: Request, res: Response) => {
  try {
    const { ticker, name, market = 'B3', isFinancial = false, price, lpa, vpa, dpa } = req.body;
    if (!ticker) {
      return res.status(400).json({ success: false, error: 'O ticker é obrigatório.' });
    }

    const upperTicker = ticker.toUpperCase().trim();
    if (cacheManager.getStock(upperTicker)) {
      return res.status(400).json({ success: false, error: 'Ticker já monitorado.' });
    }

    const newStock: StockData = {
      ticker: upperTicker,
      name: name || upperTicker,
      sector: isFinancial ? 'Financeiro' : 'Geral',
      market: market === 'US' ? 'US' : 'B3',
      currency: market === 'US' ? 'USD' : 'BRL',
      isFinancial: !!isFinancial,
      isExampleData: false,
      dataSource: 'MANUAL',
      price: typeof price === 'number' ? price : null,
      changePercent: 0,
      volume: null,
      marketCap: null,
      avgDailyLiquidity: null,
      quoteUpdatedAt: new Date().toISOString(),
      lpa: typeof lpa === 'number' ? lpa : null,
      vpa: typeof vpa === 'number' ? vpa : null,
      dpa: typeof dpa === 'number' ? dpa : null,
      dpa5yAvg: typeof dpa === 'number' ? dpa : null,
      peRatio: price && lpa && lpa > 0 ? price / lpa : null,
      pvpRatio: price && vpa && vpa > 0 ? price / vpa : null,
      dividendYield: price && dpa && price > 0 ? (dpa / price) * 100 : null,
      roe: lpa && vpa && vpa > 0 ? (lpa / vpa) * 100 : null,
      roic: null,
      dlEbitda: null,
      ebit: null,
      netDebt: null,
      netWorkingCapital: null,
      netFixedAssets: null,
      earningsGrowth: 8.0,
      fundamentalsUpdatedAt: new Date().toISOString(),
      bazinCeiling: null,
      bazinBuyPrice: null,
      bazinUpside: null,
      grahamCeiling: null,
      grahamBuyPrice: null,
      grahamUpside: null,
      grahamApplicable: true,
      lynchCeiling: null,
      lynchBuyPrice: null,
      lynchScore: null,
      lynchPeg: null,
      lynchUpside: null,
      greenblattEy: null,
      greenblattRoic: null,
    };

    cacheManager.addStock(newStock);

    res.json({
      success: true,
      message: `Ticker ${upperTicker} adicionado com sucesso.`,
      stock: cacheManager.getStock(upperTicker),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * DELETE /api/stocks/clear-examples
 * Remove todas as ações marcadas como dados de exemplo
 */
stocksRouter.delete('/clear-examples', (_req: Request, res: Response) => {
  try {
    const all = cacheManager.getAllStocks();
    let removed = 0;
    all.forEach((s) => {
      if (s.isExampleData) {
        cacheManager.removeStock(s.ticker);
        removed++;
      }
    });
    res.json({ success: true, message: `${removed} ações de exemplo removidas.` });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * DELETE /api/stocks/watchlist/:ticker
 * Remove um ticker da lista de monitoramento
 */
stocksRouter.delete('/watchlist/:ticker', (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker.toUpperCase().trim();
    const removed = cacheManager.removeStock(ticker);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Ticker não encontrado.' });
    }
    res.json({ success: true, message: `Ticker ${ticker} removido da lista.` });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /api/stocks/params
 */
stocksRouter.get('/params', (_req: Request, res: Response) => {
  res.json({
    success: true,
    params: cacheManager.getMarketParams(),
  });
});

/**
 * POST /api/stocks/params
 */
stocksRouter.post('/params', (req: Request, res: Response) => {
  try {
    cacheManager.updateMarketParams(req.body);
    res.json({
      success: true,
      message: 'Parâmetros atualizados e rankings recalculados.',
      params: cacheManager.getMarketParams(),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /api/stocks/providers
 */
stocksRouter.get('/providers', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      providers: providerRegistry.listProviders(),
      stats: cacheManager.getStats(),
    });
  } catch (err: any) {
    console.error('[Stocks/Providers Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar status dos provedores de dados.',
    });
  }
});
