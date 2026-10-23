import React from 'react';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Receipt,
  FileCheck2,
  CalendarDays
} from 'lucide-react';
import { PaymentGuide, RetentionEntry, TaxObligation } from '../types/tax';
import { formatAOA } from '../utils/taxConstants';

interface MetricCardsProps {
  entries: RetentionEntry[];
  guides: PaymentGuide[];
  obligations: TaxObligation[];
  onSelectTab: (tab: 'retencoes' | 'guias' | 'calendario') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  entries,
  guides,
  obligations,
  onSelectTab,
}) => {
  const pendingEntries = entries.filter(e => e.status === 'pendente');
  const pendingRetentionTotal = pendingEntries.reduce((sum, e) => sum + e.retentionAmount, 0);

  const activeGuides = guides.filter(g => g.status === 'gerada');
  const activeGuidesTotal = activeGuides.reduce((sum, g) => sum + g.totalRetentionAmount, 0);

  const paidGuides = guides.filter(g => g.status === 'paga');
  const paidGuidesTotal = paidGuides.reduce((sum, g) => sum + g.totalRetentionAmount, 0);

  const urgentObligation = obligations.find(o => o.status === 'proximo' || o.status === 'atrasado');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Retenções Pendentes */}
      <div 
        onClick={() => onSelectTab('retencoes')}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4.5 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
          <span className="font-medium">Retenções Pendentes</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
          {formatAOA(pendingRetentionTotal)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums font-mono">{pendingEntries.length}</span>
          <span>faturas prontas para apuramento</span>
        </div>
      </div>

      {/* Card 2: Guias DAR / RUPE em Aberto */}
      <div 
        onClick={() => onSelectTab('guias')}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4.5 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
          <span className="font-medium">Guias DAR Aguardando Pagamento</span>
          <Receipt className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
          {formatAOA(activeGuidesTotal)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums font-mono">{activeGuides.length}</span>
          <span>guias com RUPE ativo geradas</span>
        </div>
      </div>

      {/* Card 3: Impostos Liquidados */}
      <div 
        onClick={() => onSelectTab('guias')}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4.5 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs mb-2">
          <span className="font-medium">Total Liquidado à AGT</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
          {formatAOA(paidGuidesTotal)}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">{paidGuides.length}</span>
          <span>guias com comprovativo bancário</span>
        </div>
      </div>

      {/* Card 4: Alerta de Vencimento e Multas */}
      <div 
        onClick={() => onSelectTab('calendario')}
        className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4.5 cursor-pointer hover:border-amber-400 transition-all shadow-xs bg-amber-50/20 dark:bg-amber-950/10"
      >
        <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs mb-2">
          <span className="font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Alerta Fiscal AGT
          </span>
          <CalendarDays className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
          {urgentObligation ? urgentObligation.title : 'Todas as Obrigações em Dia'}
        </div>
        <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          {urgentObligation ? (
            <>
              <span className="text-amber-600 dark:text-amber-400 font-medium">Prazo: {urgentObligation.targetDueDate}</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-500 dark:text-red-400 font-mono">Coima: 25%</span>
            </>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">Nenhum atraso detetado</span>
          )}
        </div>
      </div>

    </div>
  );
};
