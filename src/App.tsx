import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PasswordGate } from './components/auth/PasswordGate';
import { ScreenerView } from './components/screener/ScreenerView';
import { BazinCalculator } from './components/calculators/BazinCalculator';
import { GrahamCalculator } from './components/calculators/GrahamCalculator';
import { LynchCalculator } from './components/calculators/LynchCalculator';
import { GreenblattCalculator } from './components/calculators/GreenblattCalculator';
import { DcfCalculator } from './components/calculators/DcfCalculator';
import { ComparisonView } from './components/calculators/ComparisonView';
import { checkAuthStatus } from './services/api';
import type { CalculatorTab, Currency } from './types/valuation';
import {
  ListOrdered,
  Coins,
  Calculator,
  TrendingUp,
  Sparkles,
  Layers,
  Scale,
  Shield,
  Loader2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('screener');
  const [currency, setCurrency] = useState<Currency>('BRL');

  // Autenticação e Proteção do Site
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modo escuro com detecção do sistema e persistência local
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('screener_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('screener_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('screener_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    checkAuthStatus()
      .then((res) => {
        setIsProtected(res.isProtected);
        if (!res.isProtected) {
          setIsAuthenticated(true);
        } else {
          const token = sessionStorage.getItem('screener_auth_token');
          if (token) {
            setIsAuthenticated(true);
          }
        }
      })
      .catch(() => {
        setIsAuthenticated(true);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    sessionStorage.removeItem('screener_auth_token');
    setIsAuthenticated(false);
  };

  const tabs: { id: CalculatorTab; label: string; sublabel: string; icon: React.ReactNode; isStar?: boolean }[] = [
    {
      id: 'screener',
      label: 'Rankings & Screener',
      sublabel: 'Tabela & Dados Automáticos',
      icon: <ListOrdered className="h-4 w-4" />,
      isStar: true,
    },
    {
      id: 'bazin',
      label: 'Bazin',
      sublabel: 'Dividendos (6%)',
      icon: <Coins className="h-4 w-4" />,
    },
    {
      id: 'graham',
      label: 'Graham',
      sublabel: 'LPA × VPA (22,5)',
      icon: <Calculator className="h-4 w-4" />,
    },
    {
      id: 'lynch',
      label: 'Peter Lynch',
      sublabel: 'PEG & Crescimento',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'greenblatt',
      label: 'Greenblatt',
      sublabel: 'Fórmula Mágica (EY & ROIC)',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'dcf',
      label: 'DCF Simplificado',
      sublabel: 'Fluxo Descontado 5a',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'comparador',
      label: 'Comparador',
      sublabel: 'Média de Todos os Tetos',
      icon: <Scale className="h-4 w-4" />,
    },
  ];

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        currency={currency}
        onCurrencyChange={setCurrency}
        isProtected={isProtected}
        onLogout={handleLogout}
      />

      <main className="container mx-auto flex-1 px-4 py-6 sm:px-6 max-w-7xl">
        {/* Navigation Tabs (Scrollable on Mobile) */}
        <div className="mb-6 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <nav className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-1">
                      {tab.label}
                      {tab.isStar && (
                        <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] text-emerald-200">
                          Fase 2
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10px] font-normal ${
                        isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {tab.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-150">
          {activeTab === 'screener' && <ScreenerView />}
          {activeTab === 'bazin' && <BazinCalculator currency={currency} />}
          {activeTab === 'graham' && <GrahamCalculator currency={currency} />}
          {activeTab === 'lynch' && <LynchCalculator currency={currency} />}
          {activeTab === 'greenblatt' && <GreenblattCalculator currency={currency} />}
          {activeTab === 'dcf' && <DcfCalculator currency={currency} />}
          {activeTab === 'comparador' && <ComparisonView currency={currency} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-medium">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Screener de Valuation • B3 & Mercado Americano • Uso Pessoal</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xl mx-auto">
            Aviso Legal: Ferramenta de estudo, não é recomendação de investimento. Os dados e cálculos apresentados nesta aplicação têm caráter exclusivamente
            educacional e de simulação quantitativa. Não constituem oferta de compra e venda de quaisquer ativos mobiliários.
          </p>
        </div>
      </footer>
    </div>
  );
}
