import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

/**
 * Gera token assinado determinístico com base na SITE_PASSWORD
 */
export function generateSessionToken(password: string): string {
  return crypto.createHmac('sha256', password).update('screener_session_auth_v1').digest('hex');
}

/**
 * Valida se o token fornecido confere com a SITE_PASSWORD
 */
export function isValidSessionToken(token: string, password: string): boolean {
  if (!token || !password) return false;
  try {
    const expected = generateSessionToken(password);
    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);
    if (tokenBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Middleware de proteção de rotas da API
 * Exige sessão autenticada para todas as rotas onde for aplicado.
 * Se SITE_PASSWORD não estiver configurada no servidor, libera acesso.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sitePassword = process.env.SITE_PASSWORD;

  // Se o proprietário não configurou senha, acesso livre
  if (!sitePassword || sitePassword.trim().length === 0) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-screener-token'];

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof customHeader === 'string') {
    token = customHeader.trim();
  }

  if (isValidSessionToken(token, sitePassword)) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Sessão inválida ou não autenticada. Faça login para continuar.',
  });
}
