import { 
  TaxSimulationInput, 
  RegimeSimulationResult, 
  SimulationComparisonSummary, 
  TaxRegimeId,
  TaxComponentBreakdown 
} from '../types/tax';

export const DEFAULT_SIMULATION_INPUT: TaxSimulationInput = {
  scenarioName: 'Cenário Base de Planeamento Tributário',
  period: 'anual',
  activitySector: 'servicos',
  grossRevenue: 120000000, // 120 Milhões Kz / R$
  operatingExpenses: 32000000,
  payrollAmount: 28000000,
  purchasesCost: 18000000,
  otherDeductibleCosts: 6000000,
  withholdingRateOnSales: 6.5,
  legislativeReformActive: false,
  corporateTaxRateAdjustment: 0,
  innovationTaxIncentive: false,
  payrollOutsourcingStrategy: 'proprio',
  profitReinvestmentRate: 0,
  environmentalExemption: false,
};

export function runTaxSimulation(input: TaxSimulationInput): SimulationComparisonSummary {
  // Annualize values if input is monthly for standard comparisons
  const multiplier = input.period === 'mensal' ? 12 : 1;
  const annualRevenue = input.grossRevenue * multiplier;
  const annualOperatingExpenses = input.operatingExpenses * multiplier;
  const annualPayroll = input.payrollAmount * multiplier;
  const annualPurchases = input.purchasesCost * multiplier;
  const annualOtherCosts = input.otherDeductibleCosts * multiplier;

  // Total direct costs before taxes
  let effectivePayroll = annualPayroll;
  let effectiveOutsourcingCost = 0;
  if (input.payrollOutsourcingStrategy === 'terceirizado') {
    // 40% reduction in direct payroll, shifted to service contractor invoice
    effectivePayroll = annualPayroll * 0.2;
    effectiveOutsourcingCost = annualPayroll * 0.95;
  } else if (input.payrollOutsourcingStrategy === 'misto') {
    effectivePayroll = annualPayroll * 0.65;
    effectiveOutsourcingCost = annualPayroll * 0.45;
  }

  const totalDeductibleExpenses = 
    annualOperatingExpenses + 
    effectivePayroll + 
    effectiveOutsourcingCost + 
    annualPurchases + 
    annualOtherCosts;

  const accountingProfitBeforeTax = annualRevenue - totalDeductibleExpenses;

  // 1. Simples Nacional / Regime Simplificado
  const simplesResult = calculateSimplesNacional(
    input, 
    annualRevenue, 
    accountingProfitBeforeTax, 
    effectivePayroll
  );

  // 2. Lucro Presumido / Regime Estimado
  const presumidoResult = calculateLucroPresumido(
    input, 
    annualRevenue, 
    accountingProfitBeforeTax, 
    effectivePayroll, 
    effectiveOutsourcingCost
  );

  // 3. Lucro Real / Regime Geral
  const realResult = calculateLucroReal(
    input, 
    annualRevenue, 
    accountingProfitBeforeTax, 
    annualPurchases,
    annualOperatingExpenses,
    effectivePayroll,
    effectiveOutsourcingCost
  );

  // Find recommended regime among eligible
  const eligibleResults = [simplesResult, presumidoResult, realResult].filter(r => r.isEligible);
  let recommended = eligibleResults.reduce((prev, curr) => 
    curr.totalTaxDue < prev.totalTaxDue ? curr : prev, eligibleResults[0] || realResult
  );

  // Determine worst among eligible to calculate savings
  const worstTax = Math.max(...eligibleResults.map(r => r.totalTaxDue));
  const bestTax = recommended.totalTaxDue;
  const maxSavings = Math.max(0, worstTax - bestTax);

  // Update savings on each
  simplesResult.annualSavingsVsWorst = Math.max(0, worstTax - simplesResult.totalTaxDue);
  presumidoResult.annualSavingsVsWorst = Math.max(0, worstTax - presumidoResult.totalTaxDue);
  realResult.annualSavingsVsWorst = Math.max(0, worstTax - realResult.totalTaxDue);

  simplesResult.isRecommended = recommended.regimeId === 'simples';
  presumidoResult.isRecommended = recommended.regimeId === 'presumido';
  realResult.isRecommended = recommended.regimeId === 'real';

  const effectiveRates = eligibleResults.map(r => r.effectiveTaxRate);
  const effectiveRateSpread = Math.max(...effectiveRates) - Math.min(...effectiveRates);

  let breakEvenNote = '';
  const realMargin = annualRevenue > 0 ? (accountingProfitBeforeTax / annualRevenue) * 100 : 0;
  if (input.activitySector === 'servicos') {
    breakEvenNote = `Margem de Lucro Efetiva calculada: ${realMargin.toFixed(1)}%. Quando a margem real é inferior a 32%, o Lucro Real tende a ser mais vantajoso que o Lucro Presumido.`;
  } else {
    breakEvenNote = `Margem de Lucro Efetiva calculada: ${realMargin.toFixed(1)}%. No setor de ${input.activitySector}, o ponto de equilíbrio de migração para o Lucro Real ocorre com margens abaixo de 8% a 12%.`;
  }

  return {
    recommendedRegime: recommended.regimeId,
    recommendedName: recommended.regimeName,
    maxSavings,
    comparisonSpread: worstTax - bestTax,
    effectiveRateSpread,
    breakEvenNote,
    results: {
      simples: simplesResult,
      presumido: presumidoResult,
      real: realResult,
    },
  };
}

// -------------------------------------------------------------
// Sub-Calculators
// -------------------------------------------------------------

function calculateSimplesNacional(
  input: TaxSimulationInput, 
  revenue: number, 
  accountingProfit: number,
  payroll: number
): RegimeSimulationResult {
  // Simples Nacional revenue threshold (e.g. 4.8M R$ or 100M Kz equivalent for small business unified regime)
  const SIMPLES_LIMIT = 96000000;
  const isEligible = revenue <= SIMPLES_LIMIT;

  if (!isEligible) {
    return {
      regimeId: 'simples',
      regimeName: 'Simples Nacional / Regime Simplificado',
      regimeBadge: 'Micro & Pequenas Empresas',
      isEligible: false,
      ineligibilityReason: `Receita anual de ${revenue.toLocaleString()} excede o teto regulamentar de ${SIMPLES_LIMIT.toLocaleString()} para enquadramento no regime simplificado.`,
      corporateIncomeTax: 0,
      revenueTurnoverTax: 0,
      payrollSocialTax: 0,
      otherTaxes: 0,
      totalTaxDue: 0,
      breakdown: [],
      taxableBase: revenue,
      effectiveTaxRate: 0,
      netProfitBeforeTax: accountingProfit,
      netProfitAfterTax: accountingProfit,
      profitMarginAfterTax: revenue > 0 ? (accountingProfit / revenue) * 100 : 0,
      netCashFlowAvailable: accountingProfit,
      annualSavingsVsWorst: 0,
      isRecommended: false,
      highlights: ['Regime não aplicável devido ao volume de faturação.'],
      cautions: ['A empresa deve optar compulsoriamente entre Lucro Presumido ou Lucro Real.'],
      legalReference: 'Lei Complementar 123/06 / Regime Simplificado AGT',
    };
  }

  // Rate based on sector
  let effectiveRate = 0.08;
  if (input.activitySector === 'comercio') {
    effectiveRate = 0.065; // ~6.5% unified
  } else if (input.activitySector === 'industria') {
    effectiveRate = 0.078; // ~7.8% unified
  } else {
    // Serviços: Anexo III or V (Fator R = Folha / Faturamento)
    const factorR = revenue > 0 ? payroll / revenue : 0;
    effectiveRate = factorR >= 0.28 ? 0.095 : 0.145;
  }

  // Apply legislative reform adjustment
  if (input.legislativeReformActive) {
    effectiveRate += 0.012; // Unificação com tributos sobre consumo
  }

  // Environmental green incentive
  if (input.environmentalExemption) {
    effectiveRate *= 0.95; // 5% rebate
  }

  const totalTax = revenue * effectiveRate;
  const corporateTax = totalTax * 0.35;
  const turnoverTax = totalTax * 0.45;
  const payrollTax = totalTax * 0.20;

  const netProfit = accountingProfit - totalTax;

  const breakdown: TaxComponentBreakdown[] = [
    {
      label: 'Guia Única DAS (Imposto sobre a Renda & Faturação)',
      amount: corporateTax + turnoverTax,
      rateApplied: `${(effectiveRate * 80).toFixed(2)}%`,
      description: 'Engloba IRPJ, CSLL, PIS, COFINS e IVA/ISS unificados na guia única.',
    },
    {
      label: 'Contribuição Previdenciária Patronal Unificada (CPP)',
      amount: payrollTax,
      rateApplied: `${(effectiveRate * 20).toFixed(2)}%`,
      description: 'Encargo patronal sobre folha recolhido de forma proporcional na guia única.',
    },
  ];

  return {
    regimeId: 'simples',
    regimeName: 'Simples Nacional / Regime Simplificado',
    regimeBadge: 'Guia Única Unificada',
    isEligible: true,
    corporateIncomeTax: corporateTax,
    revenueTurnoverTax: turnoverTax,
    payrollSocialTax: payrollTax,
    otherTaxes: 0,
    totalTaxDue: totalTax,
    breakdown,
    taxableBase: revenue,
    effectiveTaxRate: revenue > 0 ? (totalTax / revenue) * 100 : 0,
    netProfitBeforeTax: accountingProfit,
    netProfitAfterTax: netProfit,
    profitMarginAfterTax: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    netCashFlowAvailable: netProfit,
    annualSavingsVsWorst: 0,
    isRecommended: false,
    highlights: [
      'Guia de recolhimento simplificada única mensal (DAS).',
      'Dispensa do cálculo individual de INSS patronal sobre folha de salários.',
      'Menor custo de conformidade contábil e obrigações acessórias reduzidas.',
    ],
    cautions: [
      'Imposto incide sobre a receita bruta total, mesmo se a empresa tiver prejuízo contábil.',
      'Não permite repasse integral de créditos de IVA/PIS/COFINS a clientes PJ.',
    ],
    legalReference: 'Estatuto das Micro e Pequenas Empresas / Regime Simplificado Tributário',
  };
}

function calculateLucroPresumido(
  input: TaxSimulationInput, 
  revenue: number, 
  accountingProfit: number,
  payroll: number,
  outsourcingCost: number
): RegimeSimulationResult {
  // Presumption Margin:
  // Services: 32%
  // Commerce/Industry: 8% (IRPJ) + 12% (CSLL/Industrial)
  let presumptionRateIncome = 0.32;
  let presumptionRateSocial = 0.32;

  if (input.activitySector === 'comercio' || input.activitySector === 'industria') {
    presumptionRateIncome = 0.08;
    presumptionRateSocial = 0.12;
  }

  const presumedBaseIncome = revenue * presumptionRateIncome;
  const presumedBaseSocial = revenue * presumptionRateSocial;

  // Corporate income tax base rate (15% + 10% surtax on excess + 9% CSLL/Industrial base = ~24% to 25%)
  const baseCorporateRate = 0.25 + (input.corporateTaxRateAdjustment / 100);
  const corporateTax = presumedBaseIncome * 0.15 + presumedBaseIncome * 0.10 + presumedBaseSocial * 0.09;
  const adjustedCorporateTax = Math.max(0, corporateTax * (1 + input.corporateTaxRateAdjustment / 25));

  // Turnover taxes (Cumulativo: PIS 0.65% + COFINS 3.0% = 3.65% + ISS 3% to 5% ou IVA sem crédito amplo = ~6.65%)
  let turnoverRate = 0.0365;
  if (input.activitySector === 'servicos') {
    turnoverRate = 0.0665; // PIS/COFINS + ISS
  } else if (input.legislativeReformActive) {
    turnoverRate = 0.085; // Impact of unified consumption taxes
  }
  const turnoverTax = revenue * turnoverRate;

  // Payroll taxes (Patronal: 20% INSS + 5.8% terceiros + RAT = 27.8%)
  const payrollSocialTax = payroll * 0.278;

  const otherTaxes = revenue * 0.003; // Imposto do Selo / Taxas locais
  const totalTax = adjustedCorporateTax + turnoverTax + payrollSocialTax + otherTaxes;
  const netProfit = accountingProfit - totalTax;

  const breakdown: TaxComponentBreakdown[] = [
    {
      label: `Imposto sobre o Lucro Presumido (Base ${(presumptionRateIncome * 100).toFixed(0)}%)`,
      amount: adjustedCorporateTax,
      rateApplied: `${(baseCorporateRate * 100).toFixed(1)}%`,
      description: `Incidente sobre a base presumida de ${(presumptionRateIncome * 100).toFixed(0)}% da receita bruta (${presumedBaseIncome.toLocaleString()} Kz).`,
    },
    {
      label: 'Tributos sobre Faturação (Regime Cumulativo)',
      amount: turnoverTax,
      rateApplied: `${(turnoverRate * 100).toFixed(2)}%`,
      description: 'PIS/COFINS cumulativo sem direito a tomada de créditos sobre despesas operacionais.',
    },
    {
      label: 'Encargos Previdenciários Patronais sobre a Folha',
      amount: payrollSocialTax,
      rateApplied: '27.8%',
      description: 'Contribuição patronal completa (INSS, Sistema S, RAT) incidente sobre a folha salarial.',
    },
  ];

  const highlights = [
    `Excelente para empresas com margens reais superiores a ${(presumptionRateIncome * 100).toFixed(0)}%.`,
    'Tributação previsível com apuração trimestral padronizada.',
    'Balanço patrimonial mais enxuto que o Lucro Real.',
  ];

  const cautions = [
    `Se a sua margem de lucro real for inferior a ${(presumptionRateIncome * 100).toFixed(0)}%, você pagará imposto sobre lucros que não auferiu.`,
    'Impossibilidade de compensar créditos sobre compras de mercadorias e prestação de serviços tomados.',
  ];

  return {
    regimeId: 'presumido',
    regimeName: 'Lucro Presumido / Regime Estimado',
    regimeBadge: 'Margem Pré-Fixada por Lei',
    isEligible: true,
    corporateIncomeTax: adjustedCorporateTax,
    revenueTurnoverTax: turnoverTax,
    payrollSocialTax,
    otherTaxes,
    totalTaxDue: totalTax,
    breakdown,
    taxableBase: presumedBaseIncome,
    effectiveTaxRate: revenue > 0 ? (totalTax / revenue) * 100 : 0,
    netProfitBeforeTax: accountingProfit,
    netProfitAfterTax: netProfit,
    profitMarginAfterTax: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    netCashFlowAvailable: netProfit,
    annualSavingsVsWorst: 0,
    isRecommended: false,
    highlights,
    cautions,
    legalReference: 'Código do Imposto Industrial / Art. 516 do RIR',
  };
}

function calculateLucroReal(
  input: TaxSimulationInput, 
  revenue: number, 
  accountingProfit: number,
  purchases: number,
  operatingExpenses: number,
  payroll: number,
  outsourcingCost: number
): RegimeSimulationResult {
  // Real Profit Base = Accounting Profit
  let taxableRealBase = Math.max(0, accountingProfit);

  // Innovation & R&D Tax Incentive (Lei do Bem / Art. 71 incentivos I&D)
  let innovationDeduction = 0;
  if (input.innovationTaxIncentive && taxableRealBase > 0) {
    innovationDeduction = (payroll * 0.3) + (operatingExpenses * 0.2);
    taxableRealBase = Math.max(0, taxableRealBase - innovationDeduction);
  }

  // Profit Reinvestment Incentive
  if (input.profitReinvestmentRate > 0 && taxableRealBase > 0) {
    const reinvestmentBenefit = (taxableRealBase * (input.profitReinvestmentRate / 100)) * 0.25;
    taxableRealBase = Math.max(0, taxableRealBase - reinvestmentBenefit);
  }

  // Corporate Tax Rate: 25% + corporateTaxRateAdjustment
  const corporateTaxRate = Math.max(0.10, 0.25 + (input.corporateTaxRateAdjustment / 100));
  const corporateIncomeTax = taxableRealBase * corporateTaxRate;

  // Non-cumulative Turnover Taxes (IVA / PIS-COFINS não-cumulativo 9.25% ou IVA 14%)
  // Generates credits on Purchases and eligible Operating Expenses!
  const grossTurnoverRate = input.legislativeReformActive ? 0.12 : 0.0925;
  const turnoverDebitOnSales = revenue * grossTurnoverRate;
  
  // Eligible inputs for tax credits (purchases of goods, electric power, outsourced services, rent)
  const eligibleCreditBase = purchases + (operatingExpenses * 0.65) + outsourcingCost;
  const turnoverCreditOnPurchases = eligibleCreditBase * grossTurnoverRate;
  const netTurnoverTax = Math.max(0, turnoverDebitOnSales - turnoverCreditOnPurchases);

  // Payroll Social Tax (28.8% full)
  const payrollSocialTax = payroll * 0.288;
  const otherTaxes = revenue * 0.002;

  const totalTax = corporateIncomeTax + netTurnoverTax + payrollSocialTax + otherTaxes;
  const netProfit = accountingProfit - totalTax;

  const breakdown: TaxComponentBreakdown[] = [
    {
      label: `Imposto sobre o Lucro Real Efetivo (${(corporateTaxRate * 100).toFixed(1)}%)`,
      amount: corporateIncomeTax,
      rateApplied: `${(corporateTaxRate * 100).toFixed(1)}%`,
      description: accountingProfit <= 0 
        ? 'Isenção de imposto sobre a renda devido a prejuízo fiscal apurado no período.' 
        : `Incidente estritamente sobre o resultado líquido real ajustado (${taxableRealBase.toLocaleString()} Kz).`,
    },
    {
      label: 'Tributos sobre Faturação Não-Cumulativos (Com Crédito)',
      amount: netTurnoverTax,
      rateApplied: `${(grossTurnoverRate * 100).toFixed(1)}% (Débito - Crédito)`,
      description: `Débito de ${turnoverDebitOnSales.toLocaleString()} Kz deduzido de créditos de ${turnoverCreditOnPurchases.toLocaleString()} Kz sobre insumos e compras.`,
    },
    {
      label: 'Encargos Previdenciários Patronais',
      amount: payrollSocialTax,
      rateApplied: '28.8%',
      description: 'Contribuição integral sobre a folha salarial de funcionários próprios.',
    },
  ];

  if (innovationDeduction > 0) {
    breakdown.push({
      label: 'Economia por Incentivo Fiscal de Inovação & I&D',
      amount: -innovationDeduction * corporateTaxRate,
      rateApplied: 'Dedução de Base',
      description: `Abatimento extraordinário de ${innovationDeduction.toLocaleString()} Kz na base tributável decorrente de P&D.`,
    });
  }

  const highlights = [
    'Justiça fiscal total: se a empresa obtiver prejuízo contábil, o imposto sobre a renda é ZERO.',
    'Aproveitamento integral de créditos fiscais sobre aquisições, insumos, alugueres e serviços tomados.',
    'Permite utilização de incentivos fiscais de inovação tecnológica, depreciação acelerada e investimentos.',
  ];

  const cautions = [
    'Exige rigor extremo na contabilidade societária, livros fiscais digitais e comprovação de todas as despesas.',
    'Alíquota nominal de tributos sobre faturação mais elevada antes da compensação de créditos.',
  ];

  return {
    regimeId: 'real',
    regimeName: 'Lucro Real / Regime Geral',
    regimeBadge: 'Apuração pelo Lucro Efetivo',
    isEligible: true,
    corporateIncomeTax,
    revenueTurnoverTax: netTurnoverTax,
    payrollSocialTax,
    otherTaxes,
    totalTaxDue: totalTax,
    breakdown,
    taxableBase: taxableRealBase,
    effectiveTaxRate: revenue > 0 ? (totalTax / revenue) * 100 : 0,
    netProfitBeforeTax: accountingProfit,
    netProfitAfterTax: netProfit,
    profitMarginAfterTax: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    netCashFlowAvailable: netProfit,
    annualSavingsVsWorst: 0,
    isRecommended: false,
    highlights,
    cautions,
    legalReference: 'Código do Imposto Industrial (Lei 26/20) / Regime Geral da AGT',
  };
}
