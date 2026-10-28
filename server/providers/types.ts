export type MarketType = 'B3' | 'US';
export type Currency = 'BRL' | 'USD';

export interface StockData {
  ticker: string;
  name: string;
  sector: string;
  market: MarketType;
  currency: Currency;
  isFinancial: boolean; // Bancos, seguradoras e financeiras (excluídas do Greenblatt)
  isExampleData: boolean; // true para ações pré-cadastradas com dados de exemplo (não vieram de API oficial)
  dataSource?: 'EXEMPLO' | 'BRAPI' | 'FMP' | 'MANUAL'; // Origem dos dados

  // Cotação
  price: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  avgDailyLiquidity: number | null;
  quoteUpdatedAt: string | null;

  // Fundamentos
  lpa: number | null; // Lucro por Ação
  vpa: number | null; // Valor Patrimonial por Ação
  dpa: number | null; // Dividendo por Ação 12m
  dpa5yAvg: number | null; // Dividendo médio 5 anos
  peRatio: number | null; // P/L
  pvpRatio: number | null; // P/VP
  dividendYield: number | null; // DY (%)
  roe: number | null; // ROE (%)
  roic: number | null; // ROIC (%)
  dlEbitda: number | null; // Dívida Líquida / EBITDA
  ebit: number | null; // Lucro Operacional
  netDebt: number | null; // Dívida Líquida
  netWorkingCapital: number | null; // Capital de Giro Líquido
  netFixedAssets: number | null; // Ativo Imobilizado Líquido
  earningsGrowth: number | null; // Crescimento Lucro 5a (%)
  fundamentalsUpdatedAt: string | null;

  // Resultados de Valuation Calculados
  bazinCeiling: number | null;
  bazinBuyPrice: number | null;
  bazinUpside: number | null;

  grahamCeiling: number | null;
  grahamBuyPrice: number | null;
  grahamUpside: number | null;
  grahamApplicable: boolean;

  lynchCeiling: number | null;
  lynchBuyPrice: number | null;
  lynchScore: number | null;
  lynchPeg: number | null;
  lynchUpside: number | null;

  greenblattEy: number | null; // Earnings Yield (%)
  greenblattRoic: number | null; // ROIC Tangível (%)

  // Rankings e Posições
  rankBazin?: number | null;
  rankGraham?: number | null;
  rankLynch?: number | null;
  rankGreenblattEy?: number | null;
  rankGreenblattRoic?: number | null;
  rankGreenblattSum?: number | null;
  rankGreenblatt?: number | null;
  rankCombined?: number | null;

  // Upside Geral (usado na tabela)
  upside?: number | null;
}

export interface StockDataProvider {
  id: string;
  name: string;
  market: MarketType;
  isConfigured(): boolean;
  getQuotes(tickers: string[]): Promise<Record<string, Partial<StockData>>>;
  getFundamentals(ticker: string): Promise<Partial<StockData> | null>;
}

export interface ApiUsageStats {
  brapiRequestsToday: number;
  fmpRequestsToday: number;
  brapiLimit: number;
  fmpLimit: number;
  lastResetDate: string;
}

export interface FilterOptions {
  market?: MarketType | 'ALL';
  minPe?: number;
  maxPe?: number;
  maxDlEbitda?: number;
  minRoe?: number;
  minLiquidity?: number;
  excludeFinancials?: boolean;
  searchQuery?: string;
}

export type RankingCriterion =
  | 'combined'
  | 'bazin'
  | 'graham'
  | 'lynch'
  | 'greenblatt';
