import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

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

  // Modo escuro padrão ativado
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('screener_theme');
    if (saved) return saved === 'dark';
    return true;
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

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e0e11]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isProtected && !isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0e0e11] text-zinc-200 flex flex-row relative">
      {/* Left Minimalist Sidebar matching Leadwave */}
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
        {/* Minimalist Top Header */}
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
        <main className="flex-1 px-6 pb-8 max-w-7xl w-full mx-auto space-y-4">
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
      </div>

      {/* Modals */}
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
