import type {
  BazinParams,
  GrahamParams,
  LynchParams,
  GreenblattParams,
  DcfParams,
} from '../types/valuation';

export interface PresetItem<T> {
  ticker: string;
  name: string;
  description: string;
  params: T;
}

export const bazinPresets: PresetItem<BazinParams>[] = [
  {
    ticker: 'BBAS3 (Banco do Brasil)',
    name: 'Banco do Brasil',
    description: 'Empresa consolidada, forte pagadora de dividendos.',
    params: {
      dividendPerShare: 4.85,
      dividendType: '12m',
      targetYield: 6.0,
      marginOfSafety: 20,
      currentPrice: 28.5,
    },
  },
  {
    ticker: 'TAEE11 (Taesa)',
    name: 'Taesa',
    description: 'Transmissora elétrica com fluxo de caixa previsível e dividendos altos.',
    params: {
      dividendPerShare: 2.8,
      dividendType: '5y_avg',
      targetYield: 6.0,
      marginOfSafety: 20,
      currentPrice: 34.9,
    },
  },
  {
    ticker: 'KO (Coca-Cola - EUA)',
    name: 'The Coca-Cola Company',
    description: 'Dividend King americano, pagando dividendos crescentes há mais de 60 anos.',
    params: {
      dividendPerShare: 1.94,
      dividendType: '12m',
      targetYield: 4.0, // Taxa exigida típica nos EUA
      marginOfSafety: 20,
      currentPrice: 65.0,
    },
  },
];

export const grahamPresets: PresetItem<GrahamParams>[] = [
  {
    ticker: 'PETR4 (Petrobras)',
    name: 'Petrobras PN',
    description: 'Múltiplos baixos de P/L e P/VP com alta geração de caixa.',
    params: {
      lpa: 6.85,
      vpa: 31.2,
      multiplier: 22.5,
      marginOfSafety: 20,
      currentPrice: 38.2,
    },
  },
  {
    ticker: 'ITSA4 (Itaúsa)',
    name: 'Itaúsa PN',
    description: 'Holding financeira negociada com desconto patrimonial.',
    params: {
      lpa: 1.48,
      vpa: 8.92,
      multiplier: 22.5,
      marginOfSafety: 20,
      currentPrice: 10.45,
    },
  },
  {
    ticker: 'EMBR3 (Embraer - Exemplo Prejuízo Passado)',
    name: 'Caso LPA/VPA Negativo',
    description: 'Exemplo para testar a validação de "não se aplica" da fórmula de Graham.',
    params: {
      lpa: -0.45,
      vpa: 12.3,
      multiplier: 22.5,
      marginOfSafety: 20,
      currentPrice: 24.1,
    },
  },
];

export const lynchPresets: PresetItem<LynchParams>[] = [
  {
    ticker: 'WEGE3 (WEG)',
    name: 'WEG S.A.',
    description: 'Forte crescimento anual do lucro e previsibilidade operacional.',
    params: {
      currentPrice: 52.0,
      lpa: 1.45,
      peRatio: 35.8,
      earningsGrowth: 22.0, // 22% ao ano
      dividendYield: 2.1,
      marginOfSafety: 20,
    },
  },
  {
    ticker: 'GOOGL (Alphabet / Google)',
    name: 'Alphabet Inc.',
    description: 'Big Tech com alto crescimento e baixo endividamento.',
    params: {
      currentPrice: 180.0,
      lpa: 8.0,
      peRatio: 22.5,
      earningsGrowth: 20.0,
      dividendYield: 0.5,
      marginOfSafety: 20,
    },
  },
  {
    ticker: 'MGLU3 (Exemplo Lynch Ruim)',
    name: 'Varejista em Transição',
    description: 'P/L muito elevado relativo ao crescimento projetado.',
    params: {
      currentPrice: 12.0,
      lpa: 0.12,
      peRatio: 100.0,
      earningsGrowth: 8.0,
      dividendYield: 0.0,
      marginOfSafety: 20,
    },
  },
];

export const greenblattPresets: PresetItem<GreenblattParams>[] = [
  {
    ticker: 'PRIO3 (PRIO - Prio S.A.)',
    name: 'PRIO',
    description: 'Alta rentabilidade sobre o capital e baixo múltiplo de EV/EBIT.',
    params: {
      ebit: 10500, // R$ milhões
      marketCap: 41000,
      netDebt: 8200,
      netWorkingCapital: 2100,
      netFixedAssets: 18500,
      sharesOutstanding: 885, // milhões
      currentPrice: 46.3,
      targetMultipleEV_EBIT: 8.0,
      marginOfSafety: 20,
    },
  },
  {
    ticker: 'VALE3 (Vale S.A.)',
    name: 'Vale',
    description: 'Forte geradora de caixa com imobilizado relevante.',
    params: {
      ebit: 68000, // R$ milhões
      marketCap: 250000,
      netDebt: 52000,
      netWorkingCapital: 18000,
      netFixedAssets: 175000,
      sharesOutstanding: 4500,
      currentPrice: 55.5,
      targetMultipleEV_EBIT: 6.0,
      marginOfSafety: 20,
    },
  },
];

export const dcfPresets: PresetItem<DcfParams>[] = [
  {
    ticker: 'VALE3 (Vale - B3)',
    name: 'Vale S.A.',
    description: 'DCF com FCF em milhões de R$, WACC de 12.5% e crescimento perpétuo de 3%.',
    params: {
      currentFcf: 42000, // R$ 42 bilhões FCF
      growthRate5y: 5.0, // 5% a.a.
      wacc: 12.5, // 12.5%
      perpetualGrowth: 3.0, // 3%
      netDebt: 52000, // R$ 52 bilhões
      sharesCount: 4500, // 4.5 bilhões de ações
      marginOfSafety: 20,
      currentPrice: 55.5,
    },
  },
  {
    ticker: 'AAPL (Apple - EUA)',
    name: 'Apple Inc.',
    description: 'Valuation em US$ bilhões, WACC 9.5%, crescimento 7% e perpetuidade 3%.',
    params: {
      currentFcf: 108, // US$ 108 bilhões
      growthRate5y: 7.0, // 7% a.a.
      wacc: 9.5, // 9.5% WACC
      perpetualGrowth: 3.0, // 3%
      netDebt: 45, // US$ 45 bilhões dívida líquida
      sharesCount: 15.2, // 15.2 bilhões de ações
      marginOfSafety: 20,
      currentPrice: 225.0,
    },
  },
];
