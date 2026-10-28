import type {
  BazinParams,
  BazinResult,
  Currency,
  DcfParams,
  DcfResult,
  DcfYearProjection,
  GrahamParams,
  GrahamResult,
  GreenblattParams,
  GreenblattResult,
  LynchParams,
  LynchResult,
} from '../types/valuation';

/**
 * Formata moeda com precisão configurável
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: Currency = 'BRL',
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  const curr = currency === 'BRL' ? 'BRL' : 'USD';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2,
  includeSign: boolean = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (includeSign && value > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * Formata números gerais com separadores de milhar
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 1. MÉTODO DÉCIO BAZIN
 * Teto = Dividendo por ação ÷ Taxa exigida (padrão 6%)
 * Preço de Compra = Teto * (1 - Margem)
 */
export function calculateBazin(params: BazinParams): BazinResult {
  const { dividendPerShare, targetYield, marginOfSafety, currentPrice } = params;

  if (dividendPerShare <= 0 || targetYield <= 0) {
    return {
      ceilingPrice: 0,
      buyPriceWithMargin: 0,
      isApplicable: false,
      notes: 'O dividendo por ação e a taxa exigida devem ser maiores que zero.',
    };
  }

  const yieldDecimal = targetYield / 100;
  const ceilingPrice = dividendPerShare / yieldDecimal;
  const marginDecimal = Math.max(0, Math.min(100, marginOfSafety)) / 100;
  const buyPriceWithMargin = ceilingPrice * (1 - marginDecimal);

  let upside: number | undefined;
  let upsideWithMargin: number | undefined;

  if (currentPrice && currentPrice > 0) {
    upside = ((ceilingPrice - currentPrice) / currentPrice) * 100;
    upsideWithMargin = ((buyPriceWithMargin - currentPrice) / currentPrice) * 100;
  }

  return {
    ceilingPrice,
    buyPriceWithMargin,
    upside,
    upsideWithMargin,
    isApplicable: true,
  };
}

/**
 * 2. MÉTODO BENJAMIN GRAHAM
 * Teto = sqrt(fator * LPA * VPA)
 * Fator padrão: 22.5 (P/L máx 15 * P/VP máx 1.5)
 * Se LPA ou VPA <= 0: "não se aplica"
 */
export function calculateGraham(params: GrahamParams): GrahamResult {
  const { lpa, vpa, multiplier = 22.5, marginOfSafety, currentPrice } = params;

  if (lpa <= 0 || vpa <= 0) {
    let reason = 'Não se aplica para empresas com prejuízo (LPA ≤ 0) ou patrimônio líquido negativo (VPA ≤ 0).';
    if (lpa <= 0 && vpa <= 0) {
      reason = 'LPA e VPA são negativos ou nulos. A fórmula clássica de Graham não se aplica.';
    } else if (lpa <= 0) {
      reason = 'LPA é negativo ou nulo (empresa sem lucro). Graham requer lucros consistentes.';
    } else if (vpa <= 0) {
      reason = 'VPA é negativo ou nulo (patrimônio líquido negativo/passivo a descoberto).';
    }

    return {
      ceilingPrice: null,
      buyPriceWithMargin: null,
      isApplicable: false,
      reasonNotApplicable: reason,
    };
  }

  if (multiplier <= 0) {
    return {
      ceilingPrice: null,
      buyPriceWithMargin: null,
      isApplicable: false,
      reasonNotApplicable: 'O fator multiplicador deve ser positivo.',
    };
  }

  const baseProduct = multiplier * lpa * vpa;
  const ceilingPrice = Math.sqrt(baseProduct);
  const marginDecimal = Math.max(0, Math.min(100, marginOfSafety)) / 100;
  const buyPriceWithMargin = ceilingPrice * (1 - marginDecimal);

  let upside: number | undefined;
  let upsideWithMargin: number | undefined;

  if (currentPrice && currentPrice > 0) {
    upside = ((ceilingPrice - currentPrice) / currentPrice) * 100;
    upsideWithMargin = ((buyPriceWithMargin - currentPrice) / currentPrice) * 100;
  }

  return {
    ceilingPrice,
    buyPriceWithMargin,
    upside,
    upsideWithMargin,
    isApplicable: true,
  };
}

/**
 * 3. MÉTODO PETER LYNCH
 * PEG = P/L ÷ crescimento anual do lucro (%)
 * Teto = LPA × crescimento anual do lucro (%)
 * Lynch Score = (crescimento + DY) ÷ P/L
 * > 2: bom / excelente pechincha
 * 1 a 2: razoável
 * < 1: ruim / sobreavaliada
 */
export function calculateLynch(params: LynchParams): LynchResult {
  const {
    currentPrice,
    lpa,
    peRatio: manualPe,
    earningsGrowth,
    dividendYield,
    marginOfSafety,
  } = params;

  let calculatedPE = manualPe ?? null;
  if (!calculatedPE && currentPrice > 0 && lpa > 0) {
    calculatedPE = currentPrice / lpa;
  }

  if (lpa <= 0) {
    return {
      pegRatio: null,
      ceilingPrice: null,
      buyPriceWithMargin: null,
      lynchScore: null,
      lynchScoreClassification: 'indefinido',
      calculatedPE,
      isApplicable: false,
      notes: 'LPA precisa ser positivo para o método de Peter Lynch.',
    };
  }

  if (earningsGrowth <= 0) {
    return {
      pegRatio: null,
      ceilingPrice: null,
      buyPriceWithMargin: null,
      lynchScore: null,
      lynchScoreClassification: 'indefinido',
      calculatedPE,
      isApplicable: false,
      notes: 'A taxa de crescimento do lucro precisa ser superior a 0%.',
    };
  }

  // Teto = LPA * crescimento (%)
  const ceilingPrice = lpa * earningsGrowth;
  const marginDecimal = Math.max(0, Math.min(100, marginOfSafety)) / 100;
  const buyPriceWithMargin = ceilingPrice * (1 - marginDecimal);

  let pegRatio: number | null = null;
  let lynchScore: number | null = null;
  let classification: 'ruim' | 'razoavel' | 'bom' | 'indefinido' = 'indefinido';

  if (calculatedPE && calculatedPE > 0) {
    pegRatio = calculatedPE / earningsGrowth;
    lynchScore = (earningsGrowth + dividendYield) / calculatedPE;

    if (lynchScore > 2) {
      classification = 'bom';
    } else if (lynchScore >= 1) {
      classification = 'razoavel';
    } else {
      classification = 'ruim';
    }
  }

  let upside: number | undefined;
  let upsideWithMargin: number | undefined;

  if (currentPrice && currentPrice > 0) {
    upside = ((ceilingPrice - currentPrice) / currentPrice) * 100;
    upsideWithMargin = ((buyPriceWithMargin - currentPrice) / currentPrice) * 100;
  }

  return {
    pegRatio,
    ceilingPrice,
    buyPriceWithMargin,
    lynchScore,
    lynchScoreClassification: classification,
    upside,
    upsideWithMargin,
    calculatedPE,
    isApplicable: true,
  };
}

/**
 * 4. FÓRMULA MÁGICA DE JOEL GREENBLATT
 * EV = Valor de Mercado + Dívida Líquida
 * Earnings Yield = EBIT ÷ EV (%)
 * ROIC = EBIT ÷ (Capital de Giro Líquido + Ativo Imobilizado Líquido) (%)
 */
export function calculateGreenblatt(params: GreenblattParams): GreenblattResult {
  const {
    ebit,
    marketCap,
    netDebt,
    netWorkingCapital,
    netFixedAssets,
    sharesOutstanding,
    currentPrice,
    targetMultipleEV_EBIT = 8,
    marginOfSafety,
  } = params;

  const ev = marketCap + netDebt;
  const tangibleCapitalEmployed = netWorkingCapital + netFixedAssets;

  let earningsYield = 0;
  let eyNotes: string | undefined;

  if (ev > 0) {
    earningsYield = (ebit / ev) * 100;
  } else {
    eyNotes = 'Enterprise Value (EV) negativo ou zero dificulta o cálculo direto de Earnings Yield.';
  }

  let roic: number | null = null;
  let roicNotes: string | undefined;

  if (tangibleCapitalEmployed > 0) {
    roic = (ebit / tangibleCapitalEmployed) * 100;
  } else {
    roicNotes = 'Capital Tangível Investido negativo ou zero.';
  }

  // Preço Teto implícito opcional baseado em múltiplo EV/EBIT justo se ações informadas
  let ceilingPrice: number | null = null;
  let buyPriceWithMargin: number | null = null;
  let upside: number | undefined;

  if (sharesOutstanding && sharesOutstanding > 0 && ebit > 0 && targetMultipleEV_EBIT > 0) {
    const targetEV = ebit * targetMultipleEV_EBIT;
    const targetMarketCap = targetEV - netDebt;
    if (targetMarketCap > 0) {
      ceilingPrice = targetMarketCap / sharesOutstanding;
      const marginDecimal = Math.max(0, Math.min(100, marginOfSafety)) / 100;
      buyPriceWithMargin = ceilingPrice * (1 - marginDecimal);

      if (currentPrice && currentPrice > 0) {
        upside = ((ceilingPrice - currentPrice) / currentPrice) * 100;
      }
    }
  }

  return {
    ev,
    earningsYield,
    tangibleCapitalEmployed,
    roic,
    ceilingPrice,
    buyPriceWithMargin,
    upside,
    isApplicable: true,
    roicNotes,
    eyNotes,
  };
}

/**
 * 5. DCF SIMPLIFICADO (FLUXO DE CAIXA DESCONTADO)
 * FCF Projetado anos 1 a 5
 * Valor Terminal = FCF_5 * (1 + g) / (WACC - g), descontado a VP no ano 5
 * Enterprise Value = Soma VP(FCF 1..5) + VP(Terminal)
 * Equity Value = Enterprise Value - Dívida Líquida
 * Preço Teto = Equity Value / Número de Ações
 */
export function calculateDcf(params: DcfParams): DcfResult {
  const {
    currentFcf,
    growthRate5y,
    wacc,
    perpetualGrowth,
    netDebt,
    sharesCount,
    marginOfSafety,
    currentPrice,
  } = params;

  if (sharesCount <= 0) {
    return {
      projections: [],
      sumPvFcf: 0,
      year5Fcf: 0,
      terminalFcf: 0,
      nominalTerminalValue: 0,
      pvTerminalValue: 0,
      enterpriseValue: 0,
      equityValue: 0,
      ceilingPrice: null,
      buyPriceWithMargin: null,
      isApplicable: false,
      error: 'O número de ações deve ser maior que zero.',
    };
  }

  const waccDec = wacc / 100;
  const perpGrowthDec = perpetualGrowth / 100;
  const growth5yDec = growthRate5y / 100;

  if (waccDec <= perpGrowthDec) {
    return {
      projections: [],
      sumPvFcf: 0,
      year5Fcf: 0,
      terminalFcf: 0,
      nominalTerminalValue: 0,
      pvTerminalValue: 0,
      enterpriseValue: 0,
      equityValue: 0,
      ceilingPrice: null,
      buyPriceWithMargin: null,
      isApplicable: false,
      error: `O WACC (${wacc}%) deve ser estritamente maior que o crescimento perpétuo g (${perpetualGrowth}%) para convergência matemática do modelo.`,
    };
  }

  const projections: DcfYearProjection[] = [];
  let sumPvFcf = 0;
  let runningFcf = currentFcf;

  for (let year = 1; year <= 5; year++) {
    runningFcf = runningFcf * (1 + growth5yDec);
    const discountFactor = Math.pow(1 + waccDec, year);
    const presentValue = runningFcf / discountFactor;

    projections.push({
      year,
      fcf: runningFcf,
      discountFactor,
      presentValue,
    });

    sumPvFcf += presentValue;
  }

  const year5Fcf = projections[4].fcf;
  const terminalFcf = year5Fcf * (1 + perpGrowthDec);
  const nominalTerminalValue = terminalFcf / (waccDec - perpGrowthDec);
  const year5DiscountFactor = Math.pow(1 + waccDec, 5);
  const pvTerminalValue = nominalTerminalValue / year5DiscountFactor;

  const enterpriseValue = sumPvFcf + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;

  let ceilingPrice: number | null = null;
  let buyPriceWithMargin: number | null = null;
  let upside: number | undefined;
  let upsideWithMargin: number | undefined;

  if (equityValue > 0) {
    ceilingPrice = equityValue / sharesCount;
    const marginDecimal = Math.max(0, Math.min(100, marginOfSafety)) / 100;
    buyPriceWithMargin = ceilingPrice * (1 - marginDecimal);

    if (currentPrice && currentPrice > 0) {
      upside = ((ceilingPrice - currentPrice) / currentPrice) * 100;
      upsideWithMargin = ((buyPriceWithMargin - currentPrice) / currentPrice) * 100;
    }
  }

  return {
    projections,
    sumPvFcf,
    year5Fcf,
    terminalFcf,
    nominalTerminalValue,
    pvTerminalValue,
    enterpriseValue,
    equityValue,
    ceilingPrice,
    buyPriceWithMargin,
    upside,
    upsideWithMargin,
    isApplicable: equityValue > 0,
    error: equityValue <= 0 ? 'O Patrimônio Líquido resultante do modelo (Enterprise Value - Dívida Líquida) ficou negativo ou nulo.' : undefined,
  };
}
