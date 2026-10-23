import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingDown, 
  Award, 
  HelpCircle, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  RefreshCw, 
  Building2, 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  Percent, 
  FileText 
} from 'lucide-react';
import { 
  TaxSimulationInput, 
  RegimeSimulationResult, 
  TaxRegimeId, 
  CompanyTaxProfile, 
  UserProfile 
} from '../types/tax';
import { 
  DEFAULT_SIMULATION_INPUT, 
  runTaxSimulation 
} from '../utils/taxSimulationEngine';
import { formatAOA } from '../utils/taxConstants';
import { downloadFile } from '../utils/exportEngine';

interface TaxSimulationViewProps {
  company: CompanyTaxProfile;
  currentUser: UserProfile;
}

export const TaxSimulationView: React.FC<TaxSimulationViewProps> = ({ company, currentUser }) => {
  const [input, setInput] = useState<TaxSimulationInput>(DEFAULT_SIMULATION_INPUT);
  const [activeTab, setActiveTab] = useState<'comparativo' | 'graficos' | 'estrategia'>('comparativo');

  // Run simulation calculations reactively
  const simulation = useMemo(() => {
    return runTaxSimulation(input);
  }, [input]);

  // Quick Preset Scenarios
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'consultoria') {
      setInput({
        ...DEFAULT_SIMULATION_INPUT,
        scenarioName: 'Consultoria de TI & Engenharia (Alta Margem)',
        activitySector: 'servicos',
        grossRevenue: 95000000,
        operatingExpenses: 15000000,
        payrollAmount: 26000000,
        purchasesCost: 4000000,
        otherDeductibleCosts: 3000000,
        innovationTaxIncentive: true,
        payrollOutsourcingStrategy: 'proprio',
      });
    } else if (presetName === 'comercio') {
      setInput({
        ...DEFAULT_SIMULATION_INPUT,
        scenarioName: 'Distribuidora Comercial (Alta Rotação / Baixa Margem)',
        activitySector: 'comercio',
        grossRevenue: 280000000,
        operatingExpenses: 35000000,
        payrollAmount: 22000000,
        purchasesCost: 195000000,
        otherDeductibleCosts: 8000000,
        innovationTaxIncentive: false,
        payrollOutsourcingStrategy: 'misto',
      });
    } else if (presetName === 'industria') {
      setInput({
        ...DEFAULT_SIMULATION_INPUT,
        scenarioName: 'Indústria Transformadora com Investimento em I&D',
        activitySector: 'industria',
        grossRevenue: 340000000,
        operatingExpenses: 52000000,
        payrollAmount: 58000000,
        purchasesCost: 160000000,
        otherDeductibleCosts: 18000000,
        innovationTaxIncentive: true,
        profitReinvestmentRate: 20,
        environmentalExemption: true,
      });
    } else if (presetName === 'pequena_empresa') {
      setInput({
        ...DEFAULT_SIMULATION_INPUT,
        scenarioName: 'Sociedade de Serviços em Início de Atividade',
        activitySector: 'servicos',
        grossRevenue: 38000000,
        operatingExpenses: 8000000,
        payrollAmount: 12000000,
        purchasesCost: 2000000,
        otherDeductibleCosts: 1500000,
        innovationTaxIncentive: false,
        payrollOutsourcingStrategy: 'proprio',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const r = simulation.results;
    const headers = [
      'Indicador',
      'Simples Nacional / Simplificado',
      'Lucro Presumido / Estimado',
      'Lucro Real / Geral',
    ];
    const rows = [
      ['Status Elegibilidade', r.simples.isEligible ? 'Elegível' : 'Ineligível', 'Elegível', 'Elegível'],
      ['Receita Bruta Base', formatAOA(input.grossRevenue), formatAOA(input.grossRevenue), formatAOA(input.grossRevenue)],
      ['Total de Tributos Devidos', formatAOA(r.simples.totalTaxDue), formatAOA(r.presumido.totalTaxDue), formatAOA(r.real.totalTaxDue)],
      ['Carga Tributária Efetiva (%)', `${r.simples.effectiveTaxRate.toFixed(2)}%`, `${r.presumido.effectiveTaxRate.toFixed(2)}%`, `${r.real.effectiveTaxRate.toFixed(2)}%`],
      ['Imposto sobre o Lucro / Rendimento', formatAOA(r.simples.corporateIncomeTax), formatAOA(r.presumido.corporateIncomeTax), formatAOA(r.real.corporateIncomeTax)],
      ['Tributos sobre Faturação / IVA / PIS', formatAOA(r.simples.revenueTurnoverTax), formatAOA(r.presumido.revenueTurnoverTax), formatAOA(r.real.revenueTurnoverTax)],
      ['Encargos Previdenciários Patronais', formatAOA(r.simples.payrollSocialTax), formatAOA(r.presumido.payrollSocialTax), formatAOA(r.real.payrollSocialTax)],
      ['Lucro Líquido Final Disponível', formatAOA(r.simples.netProfitAfterTax), formatAOA(r.presumido.netProfitAfterTax), formatAOA(r.real.netProfitAfterTax)],
      ['Margem Líquida (%)', `${r.simples.profitMarginAfterTax.toFixed(2)}%`, `${r.presumido.profitMarginAfterTax.toFixed(2)}%`, `${r.real.profitMarginAfterTax.toFixed(2)}%`],
      ['Economia Anual vs Pior Regime', formatAOA(r.simples.annualSavingsVsWorst), formatAOA(r.presumido.annualSavingsVsWorst), formatAOA(r.real.annualSavingsVsWorst)],
      ['Recomendação Estratégica', r.simples.isRecommended ? 'MAIS VANTAJOSO' : 'Menos favorável', r.presumido.isRecommended ? 'MAIS VANTAJOSO' : 'Menos favorável', r.real.isRecommended ? 'MAIS VANTAJOSO' : 'Menos favorável'],
    ];

    const content = [
      `RELATORIO COMPARATIVO DE SIMULACAO FISCAL E TRIBUTARIA - ${input.scenarioName.toUpperCase()}`,
      `EMPRESA;${company.companyName};NIF;${company.nif}`,
      `DATA DA SIMULACAO;${new Date().toLocaleString('pt-AO')}`,
      `REGIME RECOMENDADO;${simulation.recommendedName};ECONOMIA ANUAL;${formatAOA(simulation.maxSavings)}`,
      '',
      headers.join(';'),
      ...rows.map(r => r.join(';')),
    ].join('\r\n');

    downloadFile(content, `Simulacao_Regimes_Fiscais_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const recommendedResult = simulation.results[simulation.recommendedRegime];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Recommendations and Potential Savings */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-neutral-900 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>Simulação Fiscal Avançada & Inteligência de Regimes</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Regime Mais Vantajoso: <span className="text-amber-600 dark:text-amber-400">{simulation.recommendedName}</span>
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
              Com base nos dados hipotéticos inseridos, a opção pelo <strong>{simulation.recommendedName}</strong> proporciona a menor carga tributária efetiva ({recommendedResult.effectiveTaxRate.toFixed(2)}%), gerando uma economia anual projetada de até <strong>{formatAOA(simulation.maxSavings)}</strong> em relação ao regime menos favorável.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-800 text-center min-w-[200px] shadow-xs">
              <span className="text-[10px] text-neutral-500 uppercase font-mono font-semibold">Economia Fiscal Anual Projetada</span>
              <div className="text-lg font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatAOA(simulation.maxSavings)}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Diferencial de {(simulation.effectiveRateSpread).toFixed(1)} p.p. na carga
              </span>
            </div>

            <div className="no-print flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                <span>Imprimir Estudo</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preset chips for fast testing */}
        <div className="no-print mt-5 pt-4 border-t border-amber-200 dark:border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Cenários Rápidos:
          </span>
          <button
            onClick={() => handleApplyPreset('consultoria')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Empresa de Serviços / TI
          </button>
          <button
            onClick={() => handleApplyPreset('comercio')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Comércio de Alta Rotação
          </button>
          <button
            onClick={() => handleApplyPreset('industria')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Indústria com Inovação (P&D)
          </button>
          <button
            onClick={() => handleApplyPreset('pequena_empresa')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Pequeno Negócio em Crescimento
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Comparative Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Data Input & Decision Controls (4 cols) */}
        <div className="no-print lg:col-span-5 space-y-5">
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                  Parâmetros Financeiros Hipotéticos
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setInput(prev => ({ ...prev, period: 'anual' }))}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    input.period === 'anual' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Anual
                </button>
                <button
                  onClick={() => setInput(prev => ({ ...prev, period: 'mensal' }))}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    input.period === 'mensal' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Mensal
                </button>
              </div>
            </div>

            {/* Sector Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Setor de Atividade Económica
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['servicos', 'comercio', 'industria'] as const).map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, activitySector: sector }))}
                    className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                      input.activitySector === sector
                        ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {sector === 'servicos' ? 'Serviços' : sector === 'comercio' ? 'Comércio' : 'Indústria'}
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Receita Bruta / Faturação ({input.period})</span>
                <span className="font-mono text-amber-600 font-bold">{formatAOA(input.grossRevenue)}</span>
              </div>
              <input
                type="range"
                min="5000000"
                max="500000000"
                step="5000000"
                value={input.grossRevenue}
                onChange={(e) => setInput(prev => ({ ...prev, grossRevenue: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                <span>5M</span>
                <span>250M</span>
                <span>500M Kz</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Despesas Operacionais Dedutíveis</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatAOA(input.operatingExpenses)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={input.grossRevenue * 0.7}
                step="2000000"
                value={input.operatingExpenses}
                onChange={(e) => setInput(prev => ({ ...prev, operatingExpenses: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Payroll & Salaries */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Folha de Salários Bruta</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatAOA(input.payrollAmount)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={input.grossRevenue * 0.6}
                step="2000000"
                value={input.payrollAmount}
                onChange={(e) => setInput(prev => ({ ...prev, payrollAmount: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Purchases / Cost of Goods */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1 font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Aquisição de Mercadorias / Matérias-Primas</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatAOA(input.purchasesCost)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={input.grossRevenue * 0.8}
                step="5000000"
                value={input.purchasesCost}
                onChange={(e) => setInput(prev => ({ ...prev, purchasesCost: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

          </div>

          {/* Business Decisions & Legislative Change Impact Modifiers */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
            
            <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                Decisões Empresariais & Impacto Legislativo
              </h3>
            </div>

            {/* Decision 1: Outsourcing */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Estratégia de Força de Trabalho
              </label>
              <select
                value={input.payrollOutsourcingStrategy}
                onChange={(e) => setInput(prev => ({ ...prev, payrollOutsourcingStrategy: e.target.value as any }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                <option value="proprio">100% Quadro Próprio (Maior encargo previdenciário)</option>
                <option value="misto">Modelo Misto (65% Próprio / 35% PJ Terceirizado)</option>
                <option value="terceirizado">Alta Terceirização (Reduz folha direta e gera créditos no Lucro Real)</option>
              </select>
            </div>

            {/* Legislative Modifier 1: Tax Reform */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Simular Reforma Tributária / IVA Unificado
                </span>
                <span className="text-[11px] text-neutral-500">
                  Altera incidência cumulativa para não-cumulativa com alíquotas de consumo ajustadas.
                </span>
              </div>
              <input
                type="checkbox"
                checked={input.legislativeReformActive}
                onChange={(e) => setInput(prev => ({ ...prev, legislativeReformActive: e.target.checked }))}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            {/* Legislative Modifier 2: Tax Rate Variation */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                <span>Variação Legislativa da Alíquota do Imposto</span>
                <span className="font-mono text-amber-600 font-bold">
                  {input.corporateTaxRateAdjustment > 0 ? `+${input.corporateTaxRateAdjustment}%` : `${input.corporateTaxRateAdjustment}%`}
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={input.corporateTaxRateAdjustment}
                onChange={(e) => setInput(prev => ({ ...prev, corporateTaxRateAdjustment: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>-5% (Incentivo)</span>
                <span>0% (Atual)</span>
                <span>+5% (Agravamento)</span>
              </div>
            </div>

            {/* Incentive 1: Innovation P&D */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Incentivo de Inovação Tecnológica (P&D)
                </span>
                <span className="text-[11px] text-neutral-500">
                  Dedução de até 50% dos custos com inovação na base do Lucro Real.
                </span>
              </div>
              <input
                type="checkbox"
                checked={input.innovationTaxIncentive}
                onChange={(e) => setInput(prev => ({ ...prev, innovationTaxIncentive: e.target.checked }))}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
            </div>

            {/* Incentive 2: Reinvestment */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                <span>Reinvestimento de Lucros em Ativos (% do Lucro)</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">{input.profitReinvestmentRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={input.profitReinvestmentRate}
                onChange={(e) => setInput(prev => ({ ...prev, profitReinvestmentRate: Number(e.target.value) }))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Comparative Results & Clear Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Comparative Cards: 3 Regimes side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(['simples', 'presumido', 'real'] as const).map((regimeKey) => {
              const res = simulation.results[regimeKey];
              const isBest = res.isRecommended;
              const isWorst = res.annualSavingsVsWorst === 0 && res.isEligible;

              return (
                <div
                  key={regimeKey}
                  className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between shadow-xs ${
                    isBest
                      ? 'border-amber-500 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div>
                    {/* Header of regime card */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                        {res.regimeBadge}
                      </span>
                      {isBest && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white">
                          MELHOR OPÇÃO
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {res.regimeName}
                    </h4>

                    {!res.isEligible ? (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-[11px] text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-4 h-4 mb-1 text-red-600" />
                        <span>{res.ineligibilityReason}</span>
                      </div>
                    ) : (
                      <>
                        {/* Primary Metric: Total Tax */}
                        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <span className="text-[10px] uppercase font-mono text-neutral-500">
                            Total de Impostos Devidos
                          </span>
                          <div className={`text-base font-black font-mono tabular-nums mt-0.5 ${
                            isBest ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100'
                          }`}>
                            {formatAOA(res.totalTaxDue)}
                          </div>
                        </div>

                        {/* Effective Rate */}
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Carga Efetiva:</span>
                          <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                            {res.effectiveTaxRate.toFixed(2)}%
                          </span>
                        </div>

                        {/* Net Profit */}
                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Lucro Líquido:</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatAOA(res.netProfitAfterTax)}
                          </span>
                        </div>

                        {/* Net Margin */}
                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Margem Líquida:</span>
                          <span className="font-mono text-neutral-700 dark:text-neutral-300 tabular-nums">
                            {res.profitMarginAfterTax.toFixed(1)}%
                          </span>
                        </div>

                        {/* Difference / Savings */}
                        <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                          {res.annualSavingsVsWorst > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span>Economiza {formatAOA(res.annualSavingsVsWorst)}</span>
                            </span>
                          ) : (
                            <span className="text-neutral-400 font-mono">
                              Carga fiscal mais elevada
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Highlights list */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                    {res.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Detailed Decomposed Breakdown Table */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Demonstrativo Comparativo Detalhado por Rubrica Tributária</span>
              </h3>
              <span className="text-[10px] text-neutral-500 font-mono">Valores Anualizados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 font-semibold">
                    <th className="py-2.5 px-3">Rubrica Fiscal</th>
                    <th className="py-2.5 px-3 text-right">Simples / Simplificado</th>
                    <th className="py-2.5 px-3 text-right">Lucro Presumido</th>
                    <th className="py-2.5 px-3 text-right">Lucro Real (Geral)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      Receita Bruta Total
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(input.grossRevenue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(input.grossRevenue)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(input.grossRevenue)}</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      Imposto sobre o Lucro / Rendimento
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.simples.corporateIncomeTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.presumido.corporateIncomeTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-amber-600 font-bold">{formatAOA(simulation.results.real.corporateIncomeTax)}</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      Tributos sobre Faturação / IVA
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.simples.revenueTurnoverTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.presumido.revenueTurnoverTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.real.revenueTurnoverTax)}</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      Encargos Previdenciários Patronais
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.simples.payrollSocialTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.presumido.payrollSocialTax)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatAOA(simulation.results.real.payrollSocialTax)}</td>
                  </tr>

                  <tr className="bg-neutral-50 dark:bg-neutral-800/40 font-bold border-t-2 border-neutral-300 dark:border-neutral-700">
                    <td className="py-2.5 px-3 font-sans text-neutral-900 dark:text-neutral-100">
                      Total de Tributos a Recolher
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {simulation.results.simples.isEligible ? formatAOA(simulation.results.simples.totalTaxDue) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {formatAOA(simulation.results.presumido.totalTaxDue)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {formatAOA(simulation.results.real.totalTaxDue)}
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/30 dark:bg-emerald-950/20 font-bold">
                    <td className="py-2.5 px-3 font-sans text-emerald-900 dark:text-emerald-300">
                      Lucro Líquido Final Disponível
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                      {simulation.results.simples.isEligible ? formatAOA(simulation.results.simples.netProfitAfterTax) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatAOA(simulation.results.presumido.netProfitAfterTax)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatAOA(simulation.results.real.netProfitAfterTax)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-neutral-500">
                      Carga Tributária Efetiva
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {simulation.results.simples.isEligible ? `${simulation.results.simples.effectiveTaxRate.toFixed(2)}%` : 'Ineligível'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {simulation.results.presumido.effectiveTaxRate.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-amber-600 dark:text-amber-400">
                      {simulation.results.real.effectiveTaxRate.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Strategic Insight Box */}
            <div className="mt-4 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Análise de Ponto de Equilíbrio: </span>
                {simulation.breakEvenNote}
              </div>
            </div>

          </div>

          {/* Visual Tax Composition Bar comparison */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Distribuição Visual da Carga Tributária por Regime
            </h3>
            
            {(['simples', 'presumido', 'real'] as const).map((rKey) => {
              const res = simulation.results[rKey];
              if (!res.isEligible) return null;
              const pctOfRevenue = Math.min(100, res.effectiveTaxRate);
              const profitPct = Math.max(0, res.profitMarginAfterTax);

              return (
                <div key={rKey} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-800 dark:text-neutral-200">{res.regimeName}</span>
                    <span className="font-mono text-neutral-600 dark:text-neutral-400">
                      Tributos: {pctOfRevenue.toFixed(1)}% · Lucro Líquido: {profitPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex">
                    <div 
                      style={{ width: `${pctOfRevenue}%` }} 
                      className={`h-full ${res.isRecommended ? 'bg-amber-500' : 'bg-red-400'}`}
                      title={`Tributos: ${pctOfRevenue.toFixed(1)}%`}
                    />
                    <div 
                      style={{ width: `${profitPct}%` }} 
                      className="h-full bg-emerald-500"
                      title={`Lucro Líquido: ${profitPct.toFixed(1)}%`}
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-4 text-[11px] text-neutral-500 font-mono pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Tributos (Melhor Regime)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Tributos (Outros Regimes)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Lucro Líquido Final</span>
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
