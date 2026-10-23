import React, { useState } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  CreditCard, 
  ExternalLink, 
  Building2, 
  Eye, 
  QrCode, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { CompanyTaxProfile, PaymentGuide, RetentionEntry, UserProfile } from '../types/tax';
import { formatAOA } from '../utils/taxConstants';

interface GuidesManagerProps {
  guides: PaymentGuide[];
  entries: RetentionEntry[];
  company: CompanyTaxProfile;
  currentUser: UserProfile;
  onMarkGuidePaid: (guideId: string, proofDoc?: string) => void;
}

export const GuidesManager: React.FC<GuidesManagerProps> = ({
  guides,
  entries,
  company,
  currentUser,
  onMarkGuidePaid,
}) => {
  const [selectedGuide, setSelectedGuide] = useState<PaymentGuide | null>(null);
  const [copiedRupeId, setCopiedRupeId] = useState<string | null>(null);

  const handleCopyRupe = (rupe: string, id: string) => {
    navigator.clipboard.writeText(rupe.replace(/\s+/g, ''));
    setCopiedRupeId(id);
    setTimeout(() => setCopiedRupeId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Guias de Pagamento AGT (DAR / RUPE)</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Documentos de Arrecadação de Receitas com Código RUPE válido para liquidação via Multicaixa ou Internet Banking.
          </p>
        </div>
      </div>

      {/* Guides Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
              Nenhuma Guia de Pagamento emitida
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Selecione faturas na aba "Lançamentos & Retenções" e clique em "Emitir Guia DAR / RUPE".
            </p>
          </div>
        ) : (
          guides.map((guide) => {
            const isPaid = guide.status === 'paga';
            return (
              <div
                key={guide.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4.5 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Bar of card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {guide.guideNumber}
                      </span>
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 leading-snug">
                        {guide.taxTypeName}
                      </h3>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isPaid ? 'Liquidada' : 'Aguardando Pagamento'}
                    </span>
                  </div>

                  {/* RUPE block */}
                  <div className="my-3 p-2.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase font-mono mb-1">
                      <span>Código RUPE (Referência Única)</span>
                      <button
                        onClick={() => handleCopyRupe(guide.rupeCode, guide.id)}
                        className="text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 font-sans"
                        title="Copiar código RUPE"
                      >
                        {copiedRupeId === guide.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedRupeId === guide.id ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <div className="text-xs font-mono font-bold tracking-wider text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {guide.rupeCode}
                    </div>
                  </div>

                  {/* Multicaixa Details */}
                  <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Entidade Multicaixa:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{guide.multicaixaEntity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Referência MC:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{guide.multicaixaReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Vencimento:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{guide.dueDate}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Montante Retido:</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      {formatAOA(guide.totalRetentionAmount)}
                    </span>
                  </div>

                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedGuide(guide)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar DAR</span>
                  </button>

                  {!isPaid && currentUser.permissions.canApproveGuides && (
                    <button
                      onClick={() => onMarkGuidePaid(guide.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Validar Pagamento</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Official AGT DAR Modal with printable view */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-4xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100">
            
            {/* Modal Controls Bar */}
            <div className="no-print flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Visualização de Documento Oficial de Arrecadação de Receitas (DAR)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Printable Official AGT DAR Layout */}
            <div className="p-8 bg-white text-neutral-950 print-page space-y-6">
              
              {/* Header AGT */}
              <div className="border-b-2 border-neutral-900 pb-4 text-center">
                <div className="text-xs uppercase tracking-widest font-bold">República de Angola</div>
                <div className="text-xs uppercase tracking-wider font-semibold text-neutral-700">Ministério das Finanças</div>
                <div className="text-base font-black uppercase tracking-tight text-neutral-900 mt-1">
                  Administração Geral Tributária (AGT)
                </div>
                <div className="text-xs font-bold uppercase mt-1">
                  DAR - Documento de Arrecadação de Receitas
                </div>
                <div className="text-[11px] font-mono text-neutral-600 mt-0.5">
                  {selectedGuide.agtOffice}
                </div>
              </div>

              {/* RUPE & Multicaixa Banner */}
              <div className="grid grid-cols-2 gap-4 border border-neutral-900 p-4 rounded-lg bg-neutral-50">
                <div>
                  <div className="text-[10px] uppercase font-mono font-semibold text-neutral-600">
                    Número do Documento / N.º DAR
                  </div>
                  <div className="text-sm font-bold font-mono">{selectedGuide.guideNumber}</div>
                  
                  <div className="text-[10px] uppercase font-mono font-semibold text-neutral-600 mt-2">
                    Código RUPE (Referência Única de Pagamento)
                  </div>
                  <div className="text-base font-black font-mono tracking-wider text-amber-700">
                    {selectedGuide.rupeCode}
                  </div>
                </div>

                <div className="border-l border-neutral-300 pl-4 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="font-semibold">Entidade Multicaixa:</span>
                    <span>{selectedGuide.multicaixaEntity} (AGT RECEITAS)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Referência de Pagamento:</span>
                    <span className="font-bold text-neutral-900">{selectedGuide.multicaixaReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Data Limite de Pagamento:</span>
                    <span className="font-bold text-red-600">{selectedGuide.dueDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-300">
                    <span className="font-black text-sm">Montante a Pagar:</span>
                    <span className="font-black text-sm text-neutral-900">{formatAOA(selectedGuide.totalRetentionAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Contribuinte e Detalhes Fiscais */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-neutral-300 rounded">
                  <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">Dados do Contribuinte Retentor</div>
                  <div className="font-bold text-neutral-900">{company.companyName}</div>
                  <div className="font-mono">NIF: {company.nif}</div>
                  <div className="text-neutral-600">{company.address}, {company.city}</div>
                  <div className="text-neutral-600">Regime: {company.taxRegime}</div>
                </div>

                <div className="p-3 border border-neutral-300 rounded">
                  <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">Enquadramento Tributário</div>
                  <div className="font-bold text-neutral-900">{selectedGuide.taxTypeName}</div>
                  <div className="font-mono">Período de Referência: {selectedGuide.taxPeriod}</div>
                  <div className="font-mono">Data de Emissão: {selectedGuide.issueDate}</div>
                  <div className="text-neutral-600">Contabilista: {company.certifiedAccountantName} ({company.certifiedAccountantOrderNum})</div>
                </div>
              </div>

              {/* Relação de Faturas Integradas nesta Guia */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-2 text-neutral-800">
                  Relação de Faturas e Retenções Integradas no Apuramento
                </div>
                <table className="w-full text-xs border border-neutral-300">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-300 font-bold">
                      <th className="p-2 text-left">Fornecedor / Beneficiário</th>
                      <th className="p-2 text-left">NIF</th>
                      <th className="p-2 text-left">N.º Fatura</th>
                      <th className="p-2 text-right">Base Ilíquida (Kz)</th>
                      <th className="p-2 text-right">Taxa</th>
                      <th className="p-2 text-right">Imposto Retido (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 font-mono">
                    {entries
                      .filter(e => selectedGuide.entryIds.includes(e.id))
                      .map((e) => (
                        <tr key={e.id}>
                          <td className="p-2 font-sans font-medium">{e.supplierName}</td>
                          <td className="p-2">{e.supplierNIF}</td>
                          <td className="p-2">{e.invoiceNumber}</td>
                          <td className="p-2 text-right">{formatAOA(e.taxBaseAmount)}</td>
                          <td className="p-2 text-right">{e.appliedRate}%</td>
                          <td className="p-2 text-right font-bold">{formatAOA(e.retentionAmount)}</td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-900">
                      <td colSpan={3} className="p-2 uppercase">Total do Apuramento da Guia:</td>
                      <td className="p-2 text-right font-mono">{formatAOA(selectedGuide.totalTaxBase)}</td>
                      <td className="p-2"></td>
                      <td className="p-2 text-right font-mono text-amber-700">{formatAOA(selectedGuide.totalRetentionAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Barcode and Validation Footnotes */}
              <div className="pt-4 border-t border-neutral-300 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-neutral-500">
                    CÓDIGO DE BARRAS DE COMPROVAÇÃO MULTICAIXA / EMIS
                  </div>
                  <div className="tracking-widest font-mono text-base font-black bg-neutral-100 px-3 py-1 inline-block border border-neutral-400">
                    *982001001{selectedGuide.multicaixaReference.replace(/\s+/g, '')}*
                  </div>
                  <div className="text-[10px] text-neutral-500 max-w-md">
                    Guia gerada eletronicamente nos termos do Código do Procedimento Tributário e CIVA/CII de Angola.
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-20 h-20 border border-neutral-400 p-1 bg-white flex items-center justify-center mx-auto mb-1">
                    <QrCode className="w-16 h-16 text-neutral-800" />
                  </div>
                  <div className="text-[9px] font-mono text-neutral-500">Validação Digital AGT</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
