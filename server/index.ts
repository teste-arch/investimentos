import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { stocksRouter } from './routes/stocks';
import { authRouter } from './routes/auth';
import { cronRouter } from './routes/cron';
import { cacheManager } from './storage/cacheManager';
import { requireAuth } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware para inicialização assíncrona do cache/armazenamento externo
let initPromise: Promise<void> | null = null;
app.use(async (_req, _res, next) => {
  try {
    if (!initPromise) {
      initPromise = cacheManager.init().catch((err) => {
        console.error('[CacheManager] Erro ao inicializar cache:', err);
        initPromise = null;
      });
    }
    await initPromise;
  } catch (err) {
    console.error('[Cache Init Middleware Error]:', err);
  }
  next();
});

// Rotas da API
// /api/stocks exige sessão autenticada se SITE_PASSWORD estiver configurada
app.use('/api/stocks', requireAuth, stocksRouter);
app.use('/api/auth', authRouter);
app.use('/api/cron', cronRouter);

// Health check e Rota Raiz da API
app.get(['/api', '/api/health'], (_req, res) => {
  res.json({
    status: 'online',
    appName: 'Screener de Valuation API',
    storageType: cacheManager.getStorageType(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Middleware Global de Tratamento de Erros (Garante resposta JSON amigável)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Express Global Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Ocorreu um erro interno ao processar a requisição no servidor.',
  });
});

// Se executado diretamente (desenvolvimento local via `npm run server`)
// No ambiente Vercel (onde process.env.VERCEL é definido), não chamamos app.listen()
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Backend] Screener de Valuation rodando na porta ${PORT}`);
    console.log(`[Backend] API URL: http://localhost:${PORT}/api/stocks`);
  });
}

export default app;
