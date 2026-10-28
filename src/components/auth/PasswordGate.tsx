import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { loginSite } from '../../services/api';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, digite a senha de acesso.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginSite(password);
      if (res.success && res.token) {
        sessionStorage.setItem('screener_auth_token', res.token);
        onAuthenticated();
      }
    } catch (err: any) {
      setError(err.message || 'Senha incorreta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-left">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-4">
          <TrendingUp className="h-7 w-7" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Screener de Valuation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acesso pessoal protegido por senha
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Senha de Acesso
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-900 shadow-2xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {isLoading ? 'Verificando...' : 'Desbloquear Acesso'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-4 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Sessão segura autenticada no servidor</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 max-w-md">
        Aviso Legal: <strong>Ferramenta de estudo, não é recomendação de investimento.</strong>
      </div>
    </div>
  );
};
