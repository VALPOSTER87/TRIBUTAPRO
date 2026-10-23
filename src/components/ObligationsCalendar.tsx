import React, { useState } from 'react';
import { 
  CalendarDays, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Plus, 
  ArrowRight,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { TaxObligation, UserProfile, RetentionEntry } from '../types/tax';
import { formatAOA } from '../utils/taxConstants';

interface ObligationsCalendarProps {
  obligations: TaxObligation[];
  entries: RetentionEntry[];
  currentUser: UserProfile;
  onEmitGuideForTax: (category: string) => void;
  onMarkObligationDone: (id: string) => void;
}

export const ObligationsCalendar: React.FC<ObligationsCalendarProps> = ({
  obligations,
  entries,
  currentUser,
  onEmitGuideForTax,
  onMarkObligationDone,
}) => {
  const [selectedObligation, setSelectedObligation] = useState<TaxObligation | null>(null);

  // Calculate days remaining dynamically based on targetDueDate
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedObligations = obligations.map(ob => {
    const due = new Date(ob.targetDueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let computedStatus: TaxObligation['status'] = ob.status;
    if (ob.status !== 'concluido') {
      if (diffDays < 0) {
        computedStatus = 'atrasado';
      } else if (diffDays <= 7) {
        computedStatus = 'proximo';
      } else {
        computedStatus = 'em_dia';
      }
    }

    // Estimate total pending tax for this category
    const categoryEntries = entries.filter(e => {
      if (ob.taxCategory.includes('Industrial')) return e.taxType.startsWith('RETENCAO_SERVICOS');
      if (ob.taxCategory.includes('IRT')) return e.taxType === 'RETENCAO_IRT_B';
      if (ob.taxCategory.includes('IVA')) return e.taxType.startsWith('RETENCAO_IVA');
      if (ob.taxCategory.includes('Predial')) return e.taxType === 'RETENCAO_PREDIAL_15';
      return false;
    });

    const pendingSum = categoryEntries.filter(e => e.status === 'pendente').reduce((s, e) => s + e.retentionAmount, 0);
    const fineAmount = (pendingSum * ob.penaltyEstimateBase) / 100;

    return {
      ...ob,
      diffDays,
      status: computedStatus,
      pendingSum,
      fineAmount,
    };
  });

  return (
    <div className="space-y-5">
      
      {/* Calendar Header with Fine Prevention Warning */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CalendarDays className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Calendário Fiscal AGT & Alertas de Vencimento
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
              Monitore os prazos de entrega das retenções e declarações periódicas. Evite coimas de 25% a 100% previstas no Código Geral Tributário e juros legais de mora de 1,25% ao mês.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <div>
              <div className="font-bold">Prevenção Ativa de Coimas</div>
              <div className="text-[11px] text-red-700 dark:text-red-400">
                Alertas disparam com 15, 7 e 2 dias de antecedência.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Obligations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedObligations.map((ob) => {
          const isOverdue = ob.status === 'atrasado';
          const isWarning = ob.status === 'proximo';
          const isCompleted = ob.status === 'concluido';

          return (
            <div
              key={ob.id}
              className={`bg-white dark:bg-neutral-900 border rounded-xl p-5 transition-all shadow-xs flex flex-col justify-between ${
                isOverdue
                  ? 'border-red-300 dark:border-red-900/80 bg-red-50/10'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/10'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 dark:text-neutral-400">
                      {ob.taxCategory} · {ob.codeAGT}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      {ob.title}
                    </h3>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isOverdue
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                    {isWarning && <Clock className="w-3.5 h-3.5" />}
                    <span>
                      {isCompleted
                        ? 'Liquidado'
                        : isOverdue
                        ? `Atrasado há ${Math.abs(ob.diffDays)} dias`
                        : isWarning
                        ? `Vence em ${ob.diffDays} dias`
                        : `Vence em ${ob.diffDays} dias`}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {ob.description}
                </p>

                {/* Deadlines and Legal Base */}
                <div className="mt-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Prazo Legal Limite:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{ob.targetDueDate} ({ob.legalDeadline})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Base Jurídica:</span>
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">{ob.legalReference}</span>
                  </div>
                  {ob.pendingSum > 0 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between font-mono">
                      <span className="text-neutral-500">Imposto em Aberto:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{formatAOA(ob.pendingSum)}</span>
                    </div>
                  )}
                  {ob.fineAmount > 0 && !isCompleted && (
                    <div className="flex justify-between font-mono text-red-600 dark:text-red-400">
                      <span>Risco de Coima (25%):</span>
                      <span className="font-bold">+{formatAOA(ob.fineAmount)}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onEmitGuideForTax(ob.taxCategory)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gerar DAR desta Categoria</span>
                </button>

                {!isCompleted && (
                  <button
                    onClick={() => onMarkObligationDone(ob.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
                  >
                    Marcar Cumprida
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
