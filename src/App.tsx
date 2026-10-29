import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PasswordGate } from './components/auth/PasswordGate';
import { ScreenerView } from './components/screener/ScreenerView';
import { BazinCalculator } from './components/calculators/BazinCalculator';
import { GrahamCalculator } from './components/calculators/GrahamCalculator';
import { LynchCalculator } from './components/calculators/LynchCalculator';
import { GreenblattCalculator } from './components/calculators/GreenblattCalculator';
import { DcfCalculator } from './components/calculators/DcfCalculator';
import { ComparisonView } from './components/calculators/ComparisonView';
import { AddTickerModal } from './components/screener/AddTickerModal';
import { ProviderSettingsModal } from './components/screener/ProviderSettingsModal';
import {
  checkAuthStatus,
  addWatchlistTicker,
  updateMarketParams,
  fetchProviders,
  refreshAllStocks,
} from './services/api';
import type { MarketParameters, ProviderItem, ApiUsageStats } from './services/api';
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

  // Sidebar Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modais de Ação Rápida
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRefreshingGlobal, setIsRefreshingGlobal] = useState(false);

  // Informações de Mercado e APIs
  const [marketParams, setMarketParams] = useState<MarketParameters>({
    bazinRateB3: 6.0,
    bazinRateUS: 3.5,
    grahamMultiplier: 22.5,
    marginOfSafety: 20.0,
  });
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [stats, setStats] = useState<ApiUsageStats | undefined>();
  const [stocksCount, setStocksCount] = useState<number>(34);

  // Autenticação e Proteção
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modo escuro padrão ativado para corresponder às referências
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('screener_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark
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

    // Carregar provedores
    fetchProviders()
      .then((res) => {
        if (res.success) {
          setProviders(res.providers);
          setStats(res.stats);
        }
      })
      .catch(console.error);
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    sessionStorage.removeItem('screener_auth_token');
    setIsAuthenticated(false);
  };

  const handleRefreshAll = async () => {
    setIsRefreshingGlobal(true);
    try {
      await refreshAllStocks();
      const p = await fetchProviders();
      if (p.success) {
        setProviders(p.providers);
        setStats(p.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingGlobal(false);
    }
  };

  const handleAddTicker = async (payload: any) => {
    await addWatchlistTicker(payload);
    setStocksCount((prev) => prev + 1);
  };

  const handleSaveParams = async (params: Partial<MarketParameters>) => {
    await updateMarketParams(params);
    setMarketParams((prev) => ({ ...prev, ...params }));
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
      id: 'comparador',
      label: 'Comparador',
      sublabel: 'Média de Todos os Tetos',
      icon: <Scale className="h-4 w-4" />,
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
  ];

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-400">
            Carregando sistema de valuation...
          </span>
        </div>
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-row relative selection:bg-emerald-500 selection:text-white">
      {/* Background Ambient Lighting (Matching Image 1 & 2) */}
      <div className="ambient-glow top-0 left-48 h-[500px] w-[500px] bg-emerald-500/10 pointer-events-none" />
      <div className="ambient-glow top-1/3 right-10 h-[600px] w-[600px] bg-cyan-500/5 pointer-events-none" />

      {/* Left Modern Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isProtected={isProtected}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalStocksCount={stocksCount}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Modern Top Header with Ticker Tape */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          currency={currency}
          onCurrencyChange={setCurrency}
          isProtected={isProtected}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          activeTab={activeTab}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshingGlobal}
        />

        {/* Main Content Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Quick Method Pills (Matching Image 2 & 3 tab bar) */}
          <div className="overflow-x-auto pb-1 scrollbar-none">
            <nav className="flex space-x-2 border-b border-white/[0.06] pb-3 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-zinc-900 shadow-lg shadow-white/5 border border-white'
                        : 'border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span
                      className={`transition-colors ${
                        isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-emerald-400'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-bold flex items-center gap-1.5">
                        {tab.label}
                        {tab.isStar && (
                          <span
                            className={`rounded px-1 py-0.2 text-[9px] font-bold ${
                              isActive
                                ? 'bg-zinc-900/10 text-zinc-900'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Active View Container */}
          <div className="transition-all duration-150">
            {activeTab === 'screener' && (
              <ScreenerView
                onSelectForManualCalc={(_stock) => {
                  setActiveTab('comparador');
                }}
              />
            )}
            {activeTab === 'comparador' && <ComparisonView currency={currency} />}
            {activeTab === 'bazin' && <BazinCalculator currency={currency} />}
            {activeTab === 'graham' && <GrahamCalculator currency={currency} />}
            {activeTab === 'lynch' && <LynchCalculator currency={currency} />}
            {activeTab === 'greenblatt' && <GreenblattCalculator currency={currency} />}
            {activeTab === 'dcf' && <DcfCalculator currency={currency} />}
          </div>
        </main>

        {/* Clean Modern Footer */}
        <footer className="mt-auto border-t border-white/[0.06] bg-[#0c0d14]/60 py-6 text-zinc-400 text-xs">
          <div className="container mx-auto px-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 font-medium text-zinc-400">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Valuation Screener • B3 & Mercado Americano • Uso Pessoal</span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Aviso Legal: Ferramenta de estudo pessoal, não é recomendação de investimento. Os dados e cálculos apresentados nesta aplicação têm caráter exclusivamente educacional e quantitativo. Não constituem oferta de compra ou venda de quaisquer ativos.
            </p>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <AddTickerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTicker}
      />

      <ProviderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        marketParams={marketParams}
        onSaveParams={handleSaveParams}
        providers={providers}
        stats={stats}
      />
    </div>
  );
}
