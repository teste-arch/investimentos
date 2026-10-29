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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090a0f] p-4 text-white relative overflow-hidden">
      {/* Subtle ambient glow behind */}
      <div className="ambient-glow -top-20 -left-20 h-96 w-96 bg-emerald-500/20" />
      <div className="ambient-glow -bottom-20 -right-20 h-96 w-96 bg-cyan-500/15" />

      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#12141d]/90 backdrop-blur-xl p-8 shadow-2xl text-left relative z-10">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-white/15 to-white/5 border border-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] mb-4">
          <TrendingUp className="h-7 w-7 text-emerald-400" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight">
            Valuation Screener Pro
          </h2>
          <p className="text-xs text-zinc-400">
            Acesso protegido por autenticação
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              Senha de Acesso
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                autoFocus
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-3.5 pr-10 text-sm font-semibold text-white focus:border-white/30 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white text-zinc-900 py-3 text-xs font-bold shadow-lg hover:bg-zinc-200 active:scale-98 disabled:opacity-50 transition-all"
          >
            <Lock className="h-4 w-4" />
            {isLoading ? 'Verificando...' : 'Desbloquear Acesso'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 border-t border-white/[0.06] pt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Sessão segura autenticada no servidor</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-400 max-w-md relative z-10">
        Aviso Legal: <strong>Ferramenta de estudo, não é recomendação de investimento.</strong>
      </div>
    </div>
  );
};
