import { Router, Request, Response } from 'express';
import { generateSessionToken } from '../middleware/authMiddleware';

export const authRouter = Router();

// Configurações de proteção contra força bruta
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

interface AttemptTracker {
  failedCount: number;
  lockoutExpiresAt: number;
}

const attemptsByIp = new Map<string, AttemptTracker>();

/**
 * Obtém o IP real do cliente (suportando cabeçalhos de proxy da Vercel)
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * GET /api/auth/status
 * Informa ao frontend se a proteção por senha está ativa no servidor
 */
authRouter.get('/status', (_req: Request, res: Response) => {
  try {
    const isProtected = !!process.env.SITE_PASSWORD && process.env.SITE_PASSWORD.trim().length > 0;
    res.json({
      success: true,
      isProtected,
    });
  } catch (err: any) {
    console.error('[Auth Status Error]:', err);
    res.json({
      success: true,
      isProtected: false,
    });
  }
});

/**
 * POST /api/auth/login
 * Valida a senha simples com proteção contra ataques de força bruta
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const tracker = attemptsByIp.get(ip) || { failedCount: 0, lockoutExpiresAt: 0 };

  // Verifica se o IP está bloqueado temporariamente
  if (tracker.lockoutExpiresAt > now) {
    const remainingMinutes = Math.ceil((tracker.lockoutExpiresAt - now) / 60000);
    return res.status(429).json({
      success: false,
      error: `Muitas tentativas incorretas. Acesso bloqueado temporariamente. Tente novamente em ${remainingMinutes} minuto(s).`,
      retryAfterMinutes: remainingMinutes,
    });
  }

  // Se o período de bloqueio já expirou, reseta o contador
  if (tracker.lockoutExpiresAt > 0 && tracker.lockoutExpiresAt <= now) {
    tracker.failedCount = 0;
    tracker.lockoutExpiresAt = 0;
  }

  const { password } = req.body;
  const sitePassword = process.env.SITE_PASSWORD;

  // Se nenhuma senha estiver configurada no servidor, acesso aberto
  if (!sitePassword || sitePassword.trim().length === 0) {
    attemptsByIp.delete(ip);
    return res.json({
      success: true,
      message: 'Acesso livre (nenhuma senha configurada).',
      token: 'unprotected',
    });
  }

  // Validação da senha
  if (password === sitePassword) {
    attemptsByIp.delete(ip); // Sucesso limpa as falhas
    const token = generateSessionToken(sitePassword);
    return res.json({
      success: true,
      message: 'Autenticado com sucesso.',
      token,
    });
  }

  // Falha na senha: incrementa tentativas
  tracker.failedCount += 1;
  const attemptsLeft = MAX_FAILED_ATTEMPTS - tracker.failedCount;

  if (tracker.failedCount >= MAX_FAILED_ATTEMPTS) {
    tracker.lockoutExpiresAt = now + LOCKOUT_DURATION_MS;
    attemptsByIp.set(ip, tracker);
    return res.status(429).json({
      success: false,
      error: 'Limite de 5 tentativas excedido. Acesso bloqueado por 15 minutos.',
      retryAfterMinutes: 15,
    });
  }

  attemptsByIp.set(ip, tracker);

  return res.status(401).json({
    success: false,
    error: `Senha incorreta. Você tem mais ${attemptsLeft} tentativa(s) antes do bloqueio temporário.`,
    attemptsLeft,
  });
});
