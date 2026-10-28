import { Router, Request, Response } from 'express';
import { cacheManager } from '../storage/cacheManager';
import { providerRegistry } from '../providers/ProviderRegistry';

export const cronRouter = Router();

// Função auxiliar para aguardar entre lotes
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET ou POST /api/cron
 * Rota protegida por CRON_SECRET para execução agendada no Vercel Cron
 * Executa atualização em lotes respeitando limites de requisição
 */
const handleCronJob = async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers['authorization'];

  // Validação do segredo de autorização
  // No Vercel Cron, a requisição traz: Authorization: Bearer <CRON_SECRET>
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Tentativa de acesso não autorizada a /api/cron.');
    return res.status(401).json({
      success: false,
      error: 'Não autorizado. O cabeçalho Authorization: Bearer <CRON_SECRET> é obrigatório.',
    });
  }

  const startTime = Date.now();
  console.log('[Cron] Iniciando rotina diária de atualização agendada...');

  try {
    await cacheManager.init();
    const allStocks = cacheManager.getAllStocks();

    const b3Tickers = allStocks.filter((s) => s.market === 'B3').map((s) => s.ticker);
    const usTickers = allStocks.filter((s) => s.market === 'US').map((s) => s.ticker);

    const b3Provider = providerRegistry.getActiveProvider('B3');
    const usProvider = providerRegistry.getActiveProvider('US');

    const BATCH_SIZE = 5; // Lotes de 5 tickers para respeitar rate limits
    let updatedCount = 0;
    let b3Batches = 0;
    let usBatches = 0;

    // 1. Processa tickers da B3 em lotes
    if (b3Provider && b3Provider.isConfigured() && b3Tickers.length > 0) {
      for (let i = 0; i < b3Tickers.length; i += BATCH_SIZE) {
        const batch = b3Tickers.slice(i, i + BATCH_SIZE);
        try {
          const quotes = await b3Provider.getQuotes(batch);
          for (const [ticker, data] of Object.entries(quotes)) {
            await cacheManager.updateStockData(ticker, data);
            updatedCount++;
          }
          // Para cada papel do lote, se fundamentos expirados (24h), atualiza
          for (const ticker of batch) {
            if (cacheManager.isFundamentalsStale(ticker)) {
              const fundamentals = await b3Provider.getFundamentals(ticker);
              if (fundamentals) {
                await cacheManager.updateStockData(ticker, fundamentals);
              }
            }
          }
        } catch (err) {
          console.error(`[Cron] Erro no lote B3 [${batch.join(', ')}]:`, err);
        }
        b3Batches++;
        await delay(1200); // 1.2 segundos entre lotes
      }
    }

    // 2. Processa tickers dos EUA em lotes
    if (usProvider && usProvider.isConfigured() && usTickers.length > 0) {
      for (let i = 0; i < usTickers.length; i += BATCH_SIZE) {
        const batch = usTickers.slice(i, i + BATCH_SIZE);
        try {
          const quotes = await usProvider.getQuotes(batch);
          for (const [ticker, data] of Object.entries(quotes)) {
            await cacheManager.updateStockData(ticker, data);
            updatedCount++;
          }
          for (const ticker of batch) {
            if (cacheManager.isFundamentalsStale(ticker)) {
              const fundamentals = await usProvider.getFundamentals(ticker);
              if (fundamentals) {
                await cacheManager.updateStockData(ticker, fundamentals);
              }
            }
          }
        } catch (err) {
          console.error(`[Cron] Erro no lote US [${batch.join(', ')}]:`, err);
        }
        usBatches++;
        await delay(1200);
      }
    }

    // Se nenhuma chave de API externa estiver configurada, atualiza timestamps locais
    if (updatedCount === 0) {
      for (const s of allStocks) {
        await cacheManager.updateStockData(s.ticker, {
          quoteUpdatedAt: new Date().toISOString(),
        });
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Cron] Concluído em ${durationSeconds}s. ${updatedCount} atualizações realizadas.`);

    return res.json({
      success: true,
      message: 'Rotina diária concluída com sucesso.',
      report: {
        totalMonitored: allStocks.length,
        updatedTickers: updatedCount,
        b3Batches,
        usBatches,
        durationSeconds: `${durationSeconds}s`,
        timestamp: new Date().toISOString(),
        apiUsage: cacheManager.getStats(),
      },
    });
  } catch (error: any) {
    console.error('[Cron] Falha crítica na rotina agendada:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno na rotina de cron.',
    });
  }
};

cronRouter.get('/', handleCronJob);
cronRouter.post('/', handleCronJob);
