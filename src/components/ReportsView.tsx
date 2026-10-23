import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Filter, 
  Award,
  Layers,
  FileCheck2
} from 'lucide-react';
import { CompanyTaxProfile, RetentionEntry, UserProfile, TaxType } from '../types/tax';
import { TAX_DEFINITIONS, formatAOA } from '../utils/taxConstants';
import { 
  exportRetentionsToExcel, 
  exportAGTModelo1, 
  exportAGTModelo2, 
  exportSAFT_AO 
} from '../utils/exportEngine';

interface ReportsViewProps {
  entries: RetentionEntry[];
  company: CompanyTaxProfile;
  currentUser: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  entries,
  company,
  currentUser,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedTaxFilter, setSelectedTaxFilter] = useState<string>('todos');

  // Filter entries by selected month or general
  const periodEntries = entries.filter((e) => {
    const matchesMonth = e.invoiceDate.startsWith(selectedMonth);
    const matchesTax = selectedTaxFilter === 'todos' || e.taxType === selectedTaxFilter;
    return matchesMonth && matchesTax;
  });

  const totalBase = periodEntries.reduce((s, e) => s + e.taxBaseAmount, 0);
  const totalRetention = periodEntries.reduce((s, e) => s + e.retentionAmount, 0);
  const totalNet = periodEntries.reduce((s, e) => s + e.netPayableAmount, 0);

  // Group by Tax Type
  const groupedByTax = (Object.keys(TAX_DEFINITIONS) as TaxType[]).map((type) => {
    const typeEntries = periodEntries.filter(e => e.taxType === type);
    const sumBase = typeEntries.reduce((s, e) => s + e.taxBaseAmount, 0);
    const sumRet = typeEntries.reduce((s, e) => s + e.retentionAmount, 0);
    return {
      type,
      def: TAX_DEFINITIONS[type],
      count: typeEntries.length,
      sumBase,
      sumRet,
    };
  }).filter(g => g.count > 0);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action and Filter Ribbon (Hidden on Print) */}
      <div className="no-print bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Período de Apuramento:
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Filtro de Imposto:
            </label>
            <select
              value={selectedTaxFilter}
              onChange={(e) => setSelectedTaxFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
            >
              <option value="todos">Todos os Regimes Tributários</option>
              {Object.keys(TAX_DEFINITIONS).map(key => (
                <option key={key} value={key}>{TAX_DEFINITIONS[key as TaxType].shortName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Export & Print Hub */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintReport}
            className="px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
          <button
            onClick={() => exportRetentionsToExcel(periodEntries, company)}
            className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => exportAGTModelo1(periodEntries, company, selectedMonth)}
            className="px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>AGT Modelo 1 (.txt)</span>
          </button>
        </div>
      </div>

      {/* Official Monthly Tax Return Document (Print-ready) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xs print-page space-y-6 text-neutral-900 dark:text-neutral-100">
        
        {/* Document Header */}
        <div className="border-b-2 border-neutral-900 dark:border-neutral-100 pb-5 text-center">
          <div className="text-xs uppercase tracking-widest font-bold">República de Angola · Ministério das Finanças</div>
          <div className="text-sm uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
            Administração Geral Tributária (AGT)
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-neutral-100 mt-2">
            MAPA ANALÍTICO E DECLARAÇÃO MENSAL DE RETENÇÕES NA FONTE
          </h1>
          <div className="text-xs font-mono text-neutral-500 mt-1">
            Exercício Fiscal: {selectedMonth.slice(0, 4)} · Mês de Competência: {selectedMonth}
          </div>
        </div>

        {/* Company & Tax Representative Identification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/30">
            <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">
              Entidade Retentora (Contribuinte)
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{company.companyName}</div>
            <div className="font-mono text-xs mt-1">NIF: {company.nif}</div>
            <div className="text-neutral-600 dark:text-neutral-400 mt-0.5">{company.address}, {company.city}</div>
            <div className="text-neutral-600 dark:text-neutral-400">Regime Geral · CAE: {company.caeCode}</div>
          </div>

          <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/30">
            <div className="font-bold uppercase text-[10px] text-neutral-500 mb-1">
              Serviço Fiscal & Responsável Técnico
            </div>
            <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{company.agtOffice}</div>
            <div className="text-neutral-600 dark:text-neutral-400 mt-1">
              Contabilista Certificado: <strong>{company.certifiedAccountantName}</strong>
            </div>
            <div className="font-mono text-xs mt-0.5">Cédula Profissional: {company.certifiedAccountantOrderNum}</div>
            <div className="text-neutral-500 font-mono text-[11px] mt-1">
              Data de Emissão do Mapa: {new Date().toLocaleDateString('pt-AO')}
            </div>
          </div>
        </div>

        {/* Synthesis by Tax Category */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 text-neutral-800 dark:text-neutral-200">
            1. Síntese do Apuramento por Enquadramento Legal
          </h2>
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="p-2.5">Código AGT</th>
                  <th className="p-2.5">Natureza do Imposto / Enquadramento</th>
                  <th className="p-2.5 text-center">Registos</th>
                  <th className="p-2.5 text-right">Base Ilíquida (Kz)</th>
                  <th className="p-2.5 text-right">Imposto Retido (Kz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {groupedByTax.map((g) => (
                  <tr key={g.type}>
                    <td className="p-2.5 font-bold text-neutral-800 dark:text-neutral-200">{g.def.codeAGT}</td>
                    <td className="p-2.5 font-sans">{g.def.name}</td>
                    <td className="p-2.5 text-center">{g.count}</td>
                    <td className="p-2.5 text-right">{formatAOA(g.sumBase)}</td>
                    <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400">{formatAOA(g.sumRet)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100/60 dark:bg-neutral-800 font-bold border-t-2 border-neutral-900 dark:border-neutral-100">
                  <td colSpan={2} className="p-2.5 uppercase font-sans">Total Geral do Exercício:</td>
                  <td className="p-2.5 text-center font-mono">{periodEntries.length}</td>
                  <td className="p-2.5 text-right font-mono">{formatAOA(totalBase)}</td>
                  <td className="p-2.5 text-right font-mono text-amber-600 dark:text-amber-400">{formatAOA(totalRetention)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Detailed Analytical Table */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-2 text-neutral-800 dark:text-neutral-200">
            2. Relação Nominal de Beneficiários e Retenções Efetuadas
          </h2>
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="p-2.5">Beneficiário / Fornecedor</th>
                  <th className="p-2.5">NIF</th>
                  <th className="p-2.5">N.º Fatura</th>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5 text-right">Valor Bruto (Kz)</th>
                  <th className="p-2.5 text-right">Taxa</th>
                  <th className="p-2.5 text-right">Retido (Kz)</th>
                  <th className="p-2.5">N.º RUPE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {periodEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-neutral-400 font-sans">
                      Nenhuma retenção registada no período selecionado ({selectedMonth}).
                    </td>
                  </tr>
                ) : (
                  periodEntries.map((e) => (
                    <tr key={e.id}>
                      <td className="p-2.5 font-sans font-medium max-w-[200px] truncate">{e.supplierName}</td>
                      <td className="p-2.5">{e.supplierNIF}</td>
                      <td className="p-2.5">{e.invoiceNumber}</td>
                      <td className="p-2.5">{e.invoiceDate}</td>
                      <td className="p-2.5 text-right">{formatAOA(e.taxBaseAmount)}</td>
                      <td className="p-2.5 text-right">{e.appliedRate}%</td>
                      <td className="p-2.5 text-right font-bold text-amber-600 dark:text-amber-400">{formatAOA(e.retentionAmount)}</td>
                      <td className="p-2.5 truncate max-w-[120px]">{e.rupeNumber || 'Pendente'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-neutral-400 dark:border-neutral-600 pt-2 font-semibold">
              O Administrador / Diretor Financeiro
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Assinatura e Carimbo da Sociedade
            </div>
          </div>

          <div>
            <div className="border-t border-neutral-400 dark:border-neutral-600 pt-2 font-semibold">
              {company.certifiedAccountantName}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Contabilista Certificado · {company.certifiedAccountantOrderNum}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
