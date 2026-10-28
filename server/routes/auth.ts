import { Router, Request, Response } from 'express';

export const authRouter = Router();

/**
 * GET /api/auth/status
 * Verifica se a proteção por senha está ativa
 */
authRouter.get('/status', (_req: Request, res: Response) => {
  const isProtected = !!process.env.SITE_PASSWORD && process.env.SITE_PASSWORD.trim().length > 0;
  res.json({
    success: true,
    isProtected,
  });
});

/**
 * POST /api/auth/login
 * Valida a senha simples
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const sitePassword = process.env.SITE_PASSWORD;

  // Se não houver senha configurada, libera o acesso
  if (!sitePassword || sitePassword.trim().length === 0) {
    return res.json({
      success: true,
      message: 'Acesso livre (nenhuma senha configurada no servidor).',
      token: 'unprotected',
    });
  }

  if (password === sitePassword) {
    return res.json({
      success: true,
      message: 'Autenticado com sucesso.',
      token: 'authenticated_' + Buffer.from(sitePassword).toString('base64').substring(0, 10),
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Senha incorreta. Verifique a chave SITE_PASSWORD.',
  });
});
