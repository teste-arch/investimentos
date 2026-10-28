export type Currency = 'BRL' | 'USD';

export type CalculatorTab = 'screener' | 'bazin' | 'graham' | 'lynch' | 'greenblatt' | 'dcf' | 'comparador';

export interface BazinParams {
  dividendPerShare: number; // DPA nos últimos 12 meses ou média 5 anos
  dividendType: '12m' | '5y_avg';
  targetYield: number; // % padrão 6.0
  marginOfSafety: number; // % padrão 20
  currentPrice?: number;
}

export interface BazinResult {
  ceilingPrice: number;
  buyPriceWithMargin: number;
  upside?: number;
  upsideWithMargin?: number;
  isApplicable: boolean;
  notes?: string;
}

export interface GrahamParams {
  lpa: number; // Lucro por Ação
  vpa: number; // Valor Patrimonial por Ação
  multiplier: number; // Padrão 22.5
  marginOfSafety: number; // % padrão 20
  currentPrice?: number;
}

export interface GrahamResult {
  ceilingPrice: number | null; // null se não se aplica
  buyPriceWithMargin: number | null;
  upside?: number;
  upsideWithMargin?: number;
  isApplicable: boolean;
  reasonNotApplicable?: string;
}

export interface LynchParams {
  currentPrice: number; // Cotação atual
  lpa: number; // Lucro por Ação
  peRatio?: number; // P/L (se não informado, calcula Cotação / LPA)
  earningsGrowth: number; // Crescimento anual do lucro em % (ex: 15 para 15%)
  dividendYield: number; // Dividend Yield em % (ex: 4.5 para 4.5%)
  marginOfSafety: number; // % padrão 20
}

export interface LynchResult {
  pegRatio: number | null;
  ceilingPrice: number | null; // LPA * crescimento
  buyPriceWithMargin: number | null;
  lynchScore: number | null; // (Crescimento + DY) / P/L
  lynchScoreClassification: 'ruim' | 'razoavel' | 'bom' | 'indefinido';
  upside?: number;
  upsideWithMargin?: number;
  calculatedPE: number | null;
  isApplicable: boolean;
  notes?: string;
}

export interface GreenblattParams {
  ebit: number; // Lucro Operacional (EBIT)
  marketCap: number; // Valor de mercado
  netDebt: number; // Dívida Líquida (Dívida total - Caixa)
  netWorkingCapital: number; // Capital de Giro Líquido (Ativo Circulante - Passivo Circulante)
  netFixedAssets: number; // Ativo Imobilizado Líquido
  sharesOutstanding?: number; // Total de ações (para derivar por ação se fornecido)
  currentPrice?: number;
  targetMultipleEV_EBIT?: number; // Opcional, múltiplo EV/EBIT justo para estimar preço teto (ex: 7x ou 10x)
  marginOfSafety: number;
}

export interface GreenblattResult {
  ev: number; // Enterprise Value
  earningsYield: number; // EBIT / EV (%)
  tangibleCapitalEmployed: number; // Capital de giro líq + imobilizado líq
  roic: number | null; // EBIT / Tangible Capital (%)
  ceilingPrice?: number | null;
  buyPriceWithMargin?: number | null;
  upside?: number;
  isApplicable: boolean;
  roicNotes?: string;
  eyNotes?: string;
}

export interface DcfParams {
  currentFcf: number; // Fluxo de Caixa Livre atual (FCF_0 em R$ ou US$ milhões ou total)
  growthRate5y: number; // Crescimento anual nos primeiros 5 anos (% ao ano, ex: 10%)
  wacc: number; // Taxa de desconto WACC (% ao ano, ex: 11%)
  perpetualGrowth: number; // Crescimento perpétuo 'g' (% ao ano, ex: 3.5%)
  netDebt: number; // Dívida Líquida (Dívida Total - Caixa)
  sharesCount: number; // Número de Ações emitidas
  marginOfSafety: number; // % margem de segurança (padrão 20%)
  currentPrice?: number; // Cotação atual
}

export interface DcfYearProjection {
  year: number;
  fcf: number;
  discountFactor: number;
  presentValue: number;
}

export interface DcfResult {
  projections: DcfYearProjection[];
  sumPvFcf: number; // Soma do valor presente dos anos 1 a 5
  year5Fcf: number;
  terminalFcf: number; // FCF ano 6 = FCF5 * (1 + g)
  nominalTerminalValue: number; // Terminal Value sem desconto
  pvTerminalValue: number; // Terminal Value a valor presente
  enterpriseValue: number; // Sum PV + PV Terminal
  equityValue: number; // Enterprise Value - Dívida Líquida
  ceilingPrice: number | null; // Equity Value / Shares
  buyPriceWithMargin: number | null;
  upside?: number;
  upsideWithMargin?: number;
  isApplicable: boolean;
  error?: string;
}
