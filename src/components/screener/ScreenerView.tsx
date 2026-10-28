import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchStocks,
  refreshAllStocks,
  refreshTicker,
  addWatchlistTicker,
  removeWatchlistTicker,
  updateMarketParams,
  fetchProviders,
  clearExampleStocks,
} from '../../services/api';
import type {
  ApiStockItem,
  ApiUsageStats,
  MarketParameters,
  ProviderItem,
} from '../../services/api';
import { ScreenerFilters } from './ScreenerFilters';
import { ScreenerTable } from './ScreenerTable';
import { AddTickerModal } from './AddTickerModal';
import { ProviderSettingsModal } from './ProviderSettingsModal';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ScreenerViewProps {
  onSelectForManualCalc?: (stock: ApiStockItem) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({ onSelectForManualCalc }) => {
  const [stocks, setStocks] = useState<ApiStockItem[]>([]);
  const [stats, setStats] = useState<ApiUsageStats | undefined>();
  const [marketParams, setMarketParams] = useState<MarketParameters>({
    bazinRateB3: 6.0,
    bazinRateUS: 3.5,
    grahamMultiplier: 22.5,
    marginOfSafety: 20.0,
  });
  const [providers, setProviders] = useState<ProviderItem[]>([]);

  // Filtros
  const [market, setMarket] = useState<string>('ALL');
  const [ranking, setRanking] = useState<string>('combined');
  const [search, setSearch] = useState<string>('');
  const [minPe, setMinPe] = useState<number | ''>(3);
  const [maxPe, setMaxPe] = useState<number | ''>(15);
  const [maxDlEbitda, setMaxDlEbitda] = useState<number | ''>(5);
  const [minRoe, setMinRoe] = useState<number | ''>(10);
  const [minLiquidity, setMinLiquidity] = useState<number | ''>('');
  const [excludeFinancials, setExcludeFinancials] = useState<boolean>(false);

  // Estados de Carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshingTickers, setRefreshingTickers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchStocks({
        market,
        ranking,
        search,
        minPe,
        maxPe,
        maxDlEbitda,
        minRoe,
        minLiquidity,
        excludeFinancials,
      });

      if (res.success) {
        setStocks(res.data);
        setStats(res.stats);
        if (res.marketParams) setMarketParams(res.marketParams);
      }
    } catch (err: any) {
      setError('Não foi possível conectar ao servidor backend da API.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [market, ranking, search, minPe, maxPe, maxDlEbitda, minRoe, minLiquidity, excludeFinancials]);

  const loadProviders = async () => {
    try {
      const res = await fetchProviders();
      if (res.success) {
        setProviders(res.providers);
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Erro ao carregar provedores:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadProviders();
  }, []);

  const handleResetFilters = () => {
    setMinPe(3);
    setMaxPe(15);
    setMaxDlEbitda(5);
    setMinRoe(10);
    setMinLiquidity('');
    setExcludeFinancials(false);
    setSearch('');
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllStocks();
      await loadData();
      await loadProviders();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar ações');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshTicker = async (ticker: string) => {
    setRefreshingTickers((prev) => new Set(prev).add(ticker));
    try {
      await refreshTicker(ticker);
      await loadData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshingTickers((prev) => {
        const next = new Set(prev);
        next.delete(ticker);
        return next;
      });
    }
  };

  const handleAddTicker = async (payload: any) => {
    await addWatchlistTicker(payload);
    await loadData();
  };

  const handleRemoveTicker = async (ticker: string) => {
    if (!window.confirm(`Tem certeza que deseja remover ${ticker} da lista de monitoramento?`)) {
      return;
    }
    try {
      await removeWatchlistTicker(ticker);
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveParams = async (params: Partial<MarketParameters>) => {
    await updateMarketParams(params);
    await loadData();
  };

  const handleClearExamples = async () => {
    if (!window.confirm('Deseja remover todas as ações pré-cadastradas que possuem apenas dados de exemplo?')) {
      return;
    }
    try {
      await clearExampleStocks();
      await loadData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const exampleCount = stocks.filter((s) => s.isExampleData).length;

  return (
    <div className="space-y-5">
      {/* Mensagem de Erro de Conexão */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error} — Verifique se o servidor backend está ativo na porta 3001.</span>
        </div>
      )}

      {/* Controles de Filtros e Busca */}
      <ScreenerFilters
        market={market}
        onMarketChange={setMarket}
        ranking={ranking}
        onRankingChange={setRanking}
        search={search}
        onSearchChange={setSearch}
        minPe={minPe}
        onMinPeChange={setMinPe}
        maxPe={maxPe}
        onMaxPeChange={setMaxPe}
        maxDlEbitda={maxDlEbitda}
        onMaxDlEbitdaChange={setMaxDlEbitda}
        minRoe={minRoe}
        onMinRoeChange={setMinRoe}
        minLiquidity={minLiquidity}
        onMinLiquidityChange={setMinLiquidity}
        excludeFinancials={excludeFinancials}
        onExcludeFinancialsChange={setExcludeFinancials}
        onResetFilters={handleResetFilters}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onClearExamples={handleClearExamples}
        exampleCount={exampleCount}
        stats={stats}
        marketParams={marketParams}
        totalCount={stocks.length}
      />

      {/* Tabela de Rankings */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <span className="text-xs font-semibold">Carregando cotações e rankings...</span>
        </div>
      ) : (
        <ScreenerTable
          stocks={stocks}
          rankingCriterion={ranking}
          onRefreshTicker={handleRefreshTicker}
          onRemoveTicker={handleRemoveTicker}
          refreshingTickers={refreshingTickers}
          onSelectForManualCalc={onSelectForManualCalc}
        />
      )}

      {/* Modais */}
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
};
