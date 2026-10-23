import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Download, 
  CheckCircle2, 
  FileCode, 
  Building, 
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { CompanyTaxProfile, RetentionEntry, UserProfile } from '../types/tax';
import { exportAccountingIntegration } from '../utils/exportEngine';

interface AccountingSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RetentionEntry[];
  company: CompanyTaxProfile;
  currentUser: UserProfile;
}

export const AccountingSyncModal: React.FC<AccountingSyncModalProps> = ({
  isOpen,
  onClose,
  entries,
  company,
  currentUser,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<'primavera' | 'phc' | 'sap' | 'sage'>('primavera');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportAccountingIntegration(selectedSystem, entries, company);
    const systemNames = {
      primavera: 'Primavera BSS',
      phc: 'PHC Software',
      sap: 'SAP ERP (FB01)',
      sage: 'Sage Contabilidade',
    };
    setFeedbackMsg(`Ficheiro de integração gerado com sucesso para ${systemNames[selectedSystem]}!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const systems = [
    {
      id: 'primavera' as const,
      name: 'Primavera BSS (v10 / Evolution)',
      popularIn: 'Líder em Angola e PALOP',
      format: 'Ficheiro de Lançamentos de Diário ASCII / XML',
      accounts: 'D: 31.2.1 (Fornecedor) / C: 24.2.1 (Estado Retenção II)',
      description: 'Gera linhas de débito ao fornecedor pelo valor retido e crédito ao Estado, pronto para importação no Módulo de Contabilidade.',
    },
    {
      id: 'phc' as const,
      name: 'PHC Software (CS / Enterprise)',
      popularIn: 'Muito difundido em PMEs e Médias Empresas',
      format: 'Ficheiro de Integração de Documentos Fiscais (.CSV)',
      accounts: 'D: 31.2.1 / C: 24.2.1 / 24.1.2',
      description: 'Estruturado para o módulo de Gestão e Contabilidade PHC, com NIF do fornecedor e códigos de retenção automáticos.',
    },
    {
      id: 'sap' as const,
      name: 'SAP ERP (ECC 6.0 / S/4HANA)',
      popularIn: 'Grandes Contribuintes & Multinacionais',
      format: 'Lote Batch Input FB01 / BAPI Finance',
      accounts: 'Posting Key 21 (Vendor Debit) / Key 50 (G/L Credit 242100)',
      description: 'Lançamento automático de compensação de retenções de impostos retidos na fonte.',
    },
    {
      id: 'sage' as const,
      name: 'Sage (Sage 50 / 1000 Cloud)',
      popularIn: 'Escritórios de Contabilidade e Auditoria',
      format: 'Journal Import CSV com Tax Codes',
      accounts: 'JC Nominal Ledger PGC Angolano',
      description: 'Importação direta no diário de operações gerais da contabilidade.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-3xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Integração com Sistemas Contabilísticos (ERPs)
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Conectores Diretos: Primavera, PHC, SAP e Sage conforme o PGC Angolano
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="text-xs text-neutral-600 dark:text-neutral-300">
            Selecione o software de contabilidade utilizado pela sua organização para exportar os lançamentos em conformidade com as regras fiscais:
          </div>

          {/* System Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {systems.map((sys) => {
              const isSelected = selectedSystem === sys.id;
              return (
                <div
                  key={sys.id}
                  onClick={() => setSelectedSystem(sys.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {sys.name}
                      </h3>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">
                        {sys.popularIn}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                    {sys.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                    <div>{sys.format}</div>
                    <div className="text-neutral-500 mt-0.5 truncate">{sys.accounts}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mapping Table Preview */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-xs">
            <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Mapeamento do Plano Geral de Contabilidade (PGC):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">24.2.1:</span> Estado - Retenção Imposto Industrial
              </div>
              <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">24.1.2:</span> Estado - Retenção IRT Grupo B
              </div>
              <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">24.5.1:</span> Estado - Retenção Imposto Predial
              </div>
              <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">31.2.1:</span> Fornecedores Gerais (Conta Corrente)
              </div>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Gerar e Descarregar Ficheiro de Lançamentos</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
