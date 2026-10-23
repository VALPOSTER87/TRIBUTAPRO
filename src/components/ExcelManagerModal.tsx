import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  FileCheck, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Table,
  Sparkles
} from 'lucide-react';
import { CompanyTaxProfile, RetentionEntry, UserProfile, TaxType } from '../types/tax';
import { parseExcelOrCSV, generateExcelTemplate } from '../utils/importParser';
import { 
  exportRetentionsToExcel, 
  exportRetentionsToCSV, 
  exportAGTModelo1, 
  exportAGTModelo2, 
  exportSAFT_AO 
} from '../utils/exportEngine';
import { TAX_DEFINITIONS, formatAOA } from '../utils/taxConstants';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RetentionEntry[];
  company: CompanyTaxProfile;
  currentUser: UserProfile;
  onAddImportedEntries: (entries: RetentionEntry[]) => void;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  entries,
  company,
  currentUser,
  onAddImportedEntries,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'manual_table'>('import');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ count: number; errors: string[] } | null>(null);
  const [parsedPreviewEntries, setParsedPreviewEntries] = useState<RetentionEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');

  // Manual interactive table state
  const [manualRows, setManualRows] = useState<Array<{
    id: string;
    supplier: string;
    nif: string;
    invoice: string;
    amount: string;
    taxType: TaxType;
  }>>([
    {
      id: 'row_1',
      supplier: 'CATOCA - SOCIEDADE MINEIRA, LDA',
      nif: '5401928371',
      invoice: 'FT 2026/410',
      amount: '5000000',
      taxType: 'RETENCAO_SERVICOS_6_5',
    },
    {
      id: 'row_2',
      supplier: 'BAO STEEL ANGOLA & SERVIÇOS',
      nif: '5412984102',
      invoice: 'FT 2026/892',
      amount: '8200000',
      taxType: 'RETENCAO_SERVICOS_6_5',
    },
  ]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setImportSummary(null);

    try {
      const file = files[0];
      const buffer = await file.arrayBuffer();
      const result = await parseExcelOrCSV(buffer, currentUser.name);

      setParsedPreviewEntries(result.validEntries);
      setImportSummary({
        count: result.validEntries.length,
        errors: result.errors,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreviewEntries.length === 0) return;
    onAddImportedEntries(parsedPreviewEntries);
    onClose();
  };

  // Manual table handlers
  const handleAddManualRow = () => {
    setManualRows(prev => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        supplier: '',
        nif: '',
        invoice: '',
        amount: '',
        taxType: 'RETENCAO_SERVICOS_6_5',
      },
    ]);
  };

  const handleUpdateManualRow = (id: string, field: string, value: any) => {
    setManualRows(rows => rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleRemoveManualRow = (id: string) => {
    setManualRows(rows => rows.filter(r => r.id !== id));
  };

  const handleImportManualRows = () => {
    const valid: RetentionEntry[] = [];
    manualRows.forEach((r, idx) => {
      const gross = parseFloat(r.amount.replace(/[^0-9.]/g, '')) || 0;
      if (r.supplier.trim() && gross > 0) {
        const def = TAX_DEFINITIONS[r.taxType];
        const ret = Number(((gross * def.defaultRate) / 100).toFixed(2));
        valid.push({
          id: `manual_${Date.now()}_${idx}`,
          supplierName: r.supplier.trim(),
          supplierNIF: r.nif.trim() || '9999999999',
          supplierType: r.nif.length === 10 ? 'empresa' : 'singular',
          invoiceNumber: r.invoice.trim() || `FT-M-${idx + 1}`,
          invoiceDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          grossAmount: gross,
          taxType: r.taxType,
          appliedRate: def.defaultRate,
          taxBaseAmount: gross,
          retentionAmount: ret,
          netPayableAmount: Number((gross - ret).toFixed(2)),
          status: 'pendente',
          accountingCode: def.accountingAccountCredit,
          notes: 'Inserido manualmente na tabela Excel interativa',
          createdAt: new Date().toISOString(),
          createdBy: currentUser.name,
          documents: [],
        });
      }
    });

    if (valid.length === 0) {
      alert('Preencha pelo menos um fornecedor e valor válido na tabela.');
      return;
    }

    onAddImportedEntries(valid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-4xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Integração com Planilhas Excel & Exportação AGT
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Importação em Lote (.XLSX / .CSV), Tabela Interativa e Formatos Regulamentares
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

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950/30 shrink-0">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Importar Arquivo (.xlsx / .csv)
          </button>
          <button
            onClick={() => setActiveTab('manual_table')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'manual_table'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Tabela Interativa (Inserir Linhas)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Central de Exportação AGT & Relatórios
          </button>
        </div>

        {/* Tab 1: Import Excel */}
        {activeTab === 'import' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                Faça upload da folha de faturas ou mapa de compras para apurar as retenções em lote.
              </span>
              <button
                type="button"
                onClick={generateExcelTemplate}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Descarregar Modelo Excel (.xlsx)</span>
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors bg-neutral-50/50 dark:bg-neutral-950/20">
              <input
                type="file"
                id="excelUpload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
              <label htmlFor="excelUpload" className="cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Carregar Planilha Excel ou CSV
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Reconhecimento automático de cabeçalhos: Fornecedor, NIF, Fatura, Data, Valor Ilíquido, Imposto.
                </span>
              </label>
            </div>

            {/* Import Feedback */}
            {importSummary && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{importSummary.count} lançamentos validados e prontos para integração</span>
                </div>

                {importSummary.errors.length > 0 && (
                  <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <span className="font-semibold">Avisos de formatação:</span>
                    {importSummary.errors.slice(0, 3).map((err, idx) => (
                      <div key={idx} className="font-mono text-[11px]">• {err}</div>
                    ))}
                  </div>
                )}

                {/* Preview table */}
                <div className="mt-3 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 sticky top-0">
                      <tr>
                        <th className="p-2">Fornecedor</th>
                        <th className="p-2">NIF</th>
                        <th className="p-2">Fatura</th>
                        <th className="p-2 text-right">Base (Kz)</th>
                        <th className="p-2 text-right">Retenção (Kz)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                      {parsedPreviewEntries.slice(0, 5).map((e) => (
                        <tr key={e.id}>
                          <td className="p-2 font-sans truncate max-w-[150px]">{e.supplierName}</td>
                          <td className="p-2">{e.supplierNIF}</td>
                          <td className="p-2">{e.invoiceNumber}</td>
                          <td className="p-2 text-right">{formatAOA(e.taxBaseAmount)}</td>
                          <td className="p-2 text-right text-emerald-600">{formatAOA(e.retentionAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmar e Adicionar ao Livro Fiscal</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Interactive Table */}
        {activeTab === 'manual_table' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
              <span>Edite diretamente na grelha abaixo ou adicione novas linhas conforme a sua faturação:</span>
              <button
                type="button"
                onClick={handleAddManualRow}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Linha</span>
              </button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                  <tr>
                    <th className="p-2.5">Fornecedor / Beneficiário</th>
                    <th className="p-2.5 w-32">NIF</th>
                    <th className="p-2.5 w-28">N.º Fatura</th>
                    <th className="p-2.5 w-32">Valor Bruto (Kz)</th>
                    <th className="p-2.5 w-36">Tipo Imposto</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {manualRows.map((row) => (
                    <tr key={row.id}>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.supplier}
                          placeholder="Nome da empresa"
                          onChange={(e) => handleUpdateManualRow(row.id, 'supplier', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.nif}
                          placeholder="NIF (10 dígitos)"
                          onChange={(e) => handleUpdateManualRow(row.id, 'nif', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.invoice}
                          placeholder="FT 2026/..."
                          onChange={(e) => handleUpdateManualRow(row.id, 'invoice', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={row.amount}
                          placeholder="ex.: 5000000"
                          onChange={(e) => handleUpdateManualRow(row.id, 'amount', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 text-right"
                        />
                      </td>
                      <td className="p-1.5">
                        <select
                          value={row.taxType}
                          onChange={(e) => handleUpdateManualRow(row.id, 'taxType', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
                        >
                          <option value="RETENCAO_SERVICOS_6_5">Serviços 6,5%</option>
                          <option value="RETENCAO_SERVICOS_10_5">Não Residente 10,5%</option>
                          <option value="RETENCAO_PREDIAL_15">Predial 15%</option>
                          <option value="RETENCAO_IRT_B">IRT B 6,5%</option>
                          <option value="RETENCAO_IVA_100">IVA 100%</option>
                        </select>
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveManualRow(row.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleImportManualRows}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Integrar Linhas da Tabela no Sistema</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Export Hub */}
        {activeTab === 'export' && (
          <div className="p-6 space-y-4 overflow-y-auto">
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Período Fiscal de Referência:
              </label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box 1: AGT Modelo 1 */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-amber-600">Formato Oficial AGT</div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    Declaração Modelo 1 - Retenções na Fonte
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Ficheiro estruturado no padrão exigido pelo portal da Administração Geral Tributária para submissão eletrónica de retenções de Imposto Industrial e Predial.
                  </p>
                </div>
                <button
                  onClick={() => exportAGTModelo1(entries, company, selectedPeriod)}
                  className="mt-4 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exportar AGT Modelo 1 (.txt)</span>
                </button>
              </div>

              {/* Box 2: AGT Modelo 2 (IRT) */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-amber-600">Formato Oficial AGT</div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    Declaração Modelo 2 - IRT Grupo B
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Declaração de rendimentos pagos a prestadores individuais e independentes com discriminação de taxas de IRT e recibos emitidos.
                  </p>
                </div>
                <button
                  onClick={() => exportAGTModelo2(entries, company, selectedPeriod)}
                  className="mt-4 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exportar AGT Modelo 2 IRT (.txt)</span>
                </button>
              </div>

              {/* Box 3: SAF-T (AO) */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-emerald-600">Ficheiro XML Auditoria</div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    SAF-T (AO) Standard Audit File - Tax
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Estrutura XML em conformidade com o Decreto Executivo n.º 412/19 da AGT contendo mestres de fornecedores e lançamentos de retenções.
                  </p>
                </div>
                <button
                  onClick={() => exportSAFT_AO(entries, [], company, selectedPeriod)}
                  className="mt-4 px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar SAF-T AO Fiscal (.xml)</span>
                </button>
              </div>

              {/* Box 4: Planilha Excel (.xlsx) Completa */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-emerald-600">Planilha Completa</div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    Livro de Retenções na Fonte (.xlsx)
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Workbook Excel com fórmulas e metadados fiscais da empresa, discriminando contas de razão e referências RUPE.
                  </p>
                </div>
                <button
                  onClick={() => exportRetentionsToExcel(entries, company)}
                  className="mt-4 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarregar Livro em Excel (.xlsx)</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
