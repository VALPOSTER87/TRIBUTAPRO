import React from 'react';
import { X, Printer, Award, FileCheck2, ShieldCheck, QrCode } from 'lucide-react';
import { CompanyTaxProfile, RetentionEntry } from '../types/tax';
import { TAX_DEFINITIONS, formatAOA } from '../utils/taxConstants';

interface RetentionCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: RetentionEntry | null;
  company: CompanyTaxProfile;
}

export const RetentionCertificateModal: React.FC<RetentionCertificateModalProps> = ({
  isOpen,
  onClose,
  entry,
  company,
}) => {
  if (!isOpen || !entry) return null;

  const taxDef = TAX_DEFINITIONS[entry.taxType];
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-3xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col">
        
        {/* Controls Bar */}
        <div className="no-print flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Certificado Oficial de Retenção na Fonte (Artigo 71.º n.º 4 da Lei 26/20)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 bg-white text-neutral-950 print-page space-y-6">
          
          {/* Header */}
          <div className="text-center border-b-2 border-neutral-900 pb-4">
            <div className="text-xs uppercase tracking-widest font-bold">República de Angola</div>
            <div className="text-xs uppercase tracking-wider font-semibold text-neutral-700">Administração Geral Tributária</div>
            <h1 className="text-lg font-black uppercase tracking-tight text-neutral-900 mt-2">
              CERTIFICADO DE RETENÇÃO NA FONTE DE IMPOSTO
            </h1>
            <div className="text-[11px] font-mono text-neutral-600 mt-1">
              Comprovativo Legal para Efeitos de Dedução na Coleta do Contribuinte Retido
            </div>
          </div>

          {/* Statement */}
          <p className="text-xs leading-relaxed text-neutral-800 text-justify">
            Para os devidos efeitos legais e em cumprimento do disposto no <strong>{taxDef?.legalArticle || 'Artigo 71.º da Lei n.º 26/20'}</strong> e demais legislação fiscal angolana vigente, certifica-se que a entidade retentora abaixo identificada procedeu à retenção na fonte do imposto correspondente sobre os pagamentos efetuados:
          </p>

          {/* 1. Entidade Retentora */}
          <div className="border border-neutral-300 rounded p-3 text-xs bg-neutral-50/50">
            <div className="font-bold text-[10px] uppercase text-neutral-500 mb-1">
              1. Identificação da Entidade Retentora (Pagador)
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div><span className="font-sans font-semibold">Denominação:</span> {company.companyName}</div>
              <div><span className="font-sans font-semibold">NIF:</span> {company.nif}</div>
              <div><span className="font-sans font-semibold">Domicílio Fiscal:</span> {company.address}, {company.city}</div>
              <div><span className="font-sans font-semibold">Repartição Fiscal:</span> {company.agtOffice}</div>
            </div>
          </div>

          {/* 2. Beneficiário */}
          <div className="border border-neutral-300 rounded p-3 text-xs bg-neutral-50/50">
            <div className="font-bold text-[10px] uppercase text-neutral-500 mb-1">
              2. Identificação do Sujeito Passivo / Fornecedor Retido
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div><span className="font-sans font-semibold">Nome / Razão Social:</span> {entry.supplierName}</div>
              <div><span className="font-sans font-semibold">NIF do Beneficiário:</span> {entry.supplierNIF}</div>
              <div><span className="font-sans font-semibold">Tipo de Entidade:</span> {entry.supplierType.toUpperCase()}</div>
              <div><span className="font-sans font-semibold">N.º da Fatura / Recibo:</span> {entry.invoiceNumber}</div>
            </div>
          </div>

          {/* 3. Discriminação dos Valores */}
          <div className="border border-neutral-300 rounded overflow-hidden text-xs">
            <div className="bg-neutral-100 p-2 font-bold uppercase text-[10px] text-neutral-700">
              3. Discriminação da Operação e Apuramento da Retenção
            </div>
            <table className="w-full text-xs font-mono">
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="p-2 font-sans font-medium">Natureza do Rendimento / Imposto:</td>
                  <td className="p-2 font-bold text-right">{taxDef?.name || entry.taxType}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Data da Operação / Fatura:</td>
                  <td className="p-2 text-right">{entry.invoiceDate}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Valor Ilíquido da Fatura (Base Tributável):</td>
                  <td className="p-2 text-right font-bold">{formatAOA(entry.taxBaseAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Taxa de Retenção Aplicada:</td>
                  <td className="p-2 text-right">{entry.appliedRate}%</td>
                </tr>
                <tr className="bg-neutral-50 font-bold text-sm">
                  <td className="p-2 font-sans">VALOR TOTAL DO IMPOSTO RETIDO NA FONTE:</td>
                  <td className="p-2 text-right text-amber-800">{formatAOA(entry.retentionAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Montante Líquido Transferido ao Fornecedor:</td>
                  <td className="p-2 text-right">{formatAOA(entry.netPayableAmount)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">Referência DAR / Código RUPE:</td>
                  <td className="p-2 text-right font-bold">{entry.rupeNumber || 'DAR em Liquidação Global'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-neutral-400 pt-2 font-semibold">
                O Representante Legal
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {company.companyName}
              </div>
            </div>

            <div>
              <div className="border-t border-neutral-400 pt-2 font-semibold">
                O Contabilista Certificado
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {company.certifiedAccountantName} ({company.certifiedAccountantOrderNum})
              </div>
              <div className="inline-block mt-2 px-3 py-1 border border-neutral-400 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                Chancela Digital OCPCA Validada
              </div>
            </div>
          </div>

          {/* Digital validation seal */}
          <div className="pt-4 border-t border-neutral-300 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <div>Documento emitido via TributaPro AGT · Identificador: CERT-{entry.id}</div>
            <div>Emitido em: {new Date().toLocaleDateString('pt-AO')}</div>
          </div>

        </div>

      </div>
    </div>
  );
};
