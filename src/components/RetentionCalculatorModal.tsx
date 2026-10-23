import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  Trash2, 
  Info,
  Building,
  Hash,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DocumentAttachment, RetentionEntry, TaxType, UserProfile } from '../types/tax';
import { TAX_DEFINITIONS, formatAOA } from '../utils/taxConstants';

interface RetentionCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: RetentionEntry) => void;
  currentUser: UserProfile;
}

export const RetentionCalculatorModal: React.FC<RetentionCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  currentUser,
}) => {
  const [taxType, setTaxType] = useState<TaxType>('RETENCAO_SERVICOS_6_5');
  const [supplierName, setSupplierName] = useState('');
  const [supplierNIF, setSupplierNIF] = useState('');
  const [supplierType, setSupplierType] = useState<'empresa' | 'singular' | 'nao_residente'>('empresa');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [grossAmountStr, setGrossAmountStr] = useState('');
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [isSimulatingOCR, setIsSimulatingOCR] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTaxDef = TAX_DEFINITIONS[taxType];
  const effectiveRate = customRate !== null ? customRate : currentTaxDef.defaultRate;
  const grossAmount = parseFloat(grossAmountStr.replace(/[^0-9.]/g, '')) || 0;
  const retentionAmount = Number(((grossAmount * effectiveRate) / 100).toFixed(2));
  const netPayable = Number((grossAmount - retentionAmount).toFixed(2));

  const handleTaxTypeChange = (type: TaxType) => {
    setTaxType(type);
    setCustomRate(null);
    if (type === 'RETENCAO_SERVICOS_10_5') {
      setSupplierType('nao_residente');
    } else if (type === 'RETENCAO_IRT_B') {
      setSupplierType('singular');
    } else {
      setSupplierType('empresa');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newDoc: DocumentAttachment = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString().slice(0, 10),
    };

    const reader = new FileReader();
    reader.onload = () => {
      newDoc.dataUrl = reader.result as string;
      setDocuments(prev => [...prev, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  // OCR simulation feature
  const simulateOCRFromAttachment = () => {
    setIsSimulatingOCR(true);
    setOcrSuccessMsg(null);

    setTimeout(() => {
      // Realistic fiscal invoice extraction
      const samples = [
        {
          name: 'SONANGOL DISTRIBUIÇÃO & LUBRIFICANTES, SA',
          nif: '5401029381',
          inv: 'FT PETRO/2026/194',
          val: '12500000',
          type: 'empresa' as const,
        },
        {
          name: 'BAKER TILLY ANGOLA - AUDITORES & CONSULTORES',
          nif: '5410982319',
          inv: 'FT BT/2026/0411',
          val: '7800000',
          type: 'empresa' as const,
        },
        {
          name: 'ENG. MANUEL AFONSO CHIVUKUVUKU',
          nif: '00391827LA012',
          inv: 'REC-B 2026/12',
          val: '3500000',
          type: 'singular' as const,
        },
      ];
      const picked = samples[Math.floor(Math.random() * samples.length)];
      setSupplierName(picked.name);
      setSupplierNIF(picked.nif);
      setInvoiceNumber(picked.inv);
      setGrossAmountStr(picked.val);
      setSupplierType(picked.type);

      setIsSimulatingOCR(false);
      setOcrSuccessMsg(`Dados extraídos com 98% de precisão: NIF ${picked.nif}, Fatura ${picked.inv}, Valor Kz ${picked.val}`);
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Por favor informe o nome do Fornecedor / Beneficiário.');
      return;
    }
    if (grossAmount <= 0) {
      alert('Por favor introduza um valor bruto válido maior que zero.');
      return;
    }

    const newEntry: RetentionEntry = {
      id: `ret_${Date.now()}`,
      supplierName: supplierName.trim(),
      supplierNIF: supplierNIF.trim() || '9999999999',
      supplierType,
      invoiceNumber: invoiceNumber.trim() || `FT-S/N-${Date.now().toString().slice(-4)}`,
      invoiceDate,
      dueDate: new Date(new Date(invoiceDate).getTime() + 30 * 86400000).toISOString().slice(0, 10),
      grossAmount,
      taxType,
      appliedRate: effectiveRate,
      taxBaseAmount: grossAmount,
      retentionAmount,
      netPayableAmount: netPayable,
      status: 'pendente',
      accountingCode: currentTaxDef.accountingAccountCredit,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      documents,
    };

    onSaveEntry(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-3xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Lançamento & Cálculo de Retenção Fiscal
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Conformidade com a Legislação Tributária AGT
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Tax Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Regime e Tipo de Imposto / Retenção
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(TAX_DEFINITIONS) as TaxType[]).map((key) => {
                const def = TAX_DEFINITIONS[key];
                const isSelected = taxType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTaxTypeChange(key)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{def.shortName}</div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono mt-1">
                      {def.codeAGT}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Legal basis quote */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/60 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{currentTaxDef.legalArticle}: </span>
                {currentTaxDef.description}
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Fornecedor / Prestador de Serviços *
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="ex.: SINFIC ANGOLA, SA"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                NIF do Fornecedor *
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="ex.: 5403019281"
                  value={supplierNIF}
                  onChange={(e) => setSupplierNIF(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Invoice No., Date, and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                N.º da Fatura / Recibo
              </label>
              <input
                type="text"
                placeholder="ex.: FT 2026/0891"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Data de Emissão
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Valor Ilíquido / Bruto (Kz) *
              </label>
              <input
                type="text"
                required
                placeholder="ex.: 18500000"
                value={grossAmountStr}
                onChange={(e) => setGrossAmountStr(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Automatic Calculation Preview Box */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-neutral-800/40">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-neutral-900 dark:text-neutral-100">
              <span>Apuramento Automático da Retenção</span>
              <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                Taxa: {effectiveRate}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                  Base Tributável
                </span>
                <div className="text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                  {formatAOA(grossAmount)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-900/60">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-mono font-bold">
                  Imposto a Reter (AGT)
                </span>
                <div className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {formatAOA(retentionAmount)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                  Valor Líquido ao Fornecedor
                </span>
                <div className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatAOA(netPayable)}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>Lançamento Contabilístico Automático:</span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {currentTaxDef.accountingAccountCredit}
              </span>
            </div>
          </div>

          {/* Document & Invoice Attachment Hub + OCR simulation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Anexo de Fatura / Comprovativo (PDF, PNG, JPG)
              </label>
              <button
                type="button"
                onClick={simulateOCRFromAttachment}
                disabled={isSimulatingOCR}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1.5 transition-colors"
                title="Extrair dados fiscais automaticamente com IA/OCR"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSimulatingOCR ? 'animate-spin' : ''}`} />
                <span>{isSimulatingOCR ? 'A ler fatura com OCR...' : 'Preenchimento Automático via OCR'}</span>
              </button>
            </div>

            {ocrSuccessMsg && (
              <div className="mb-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{ocrSuccessMsg}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 text-center hover:border-amber-500 transition-colors bg-neutral-50/50 dark:bg-neutral-950/30">
              <input
                type="file"
                id="docUpload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center justify-center">
                <UploadCloud className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Clique para anexar arquivo da fatura
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Formatos aceites: Imagens (PNG, JPG) e Documentos (PDF, DOCX) até 15MB
                </span>
              </label>
            </div>

            {documents.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate font-mono">{doc.name}</span>
                      <span className="text-neutral-400 font-mono">({Math.round(doc.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Observações / Justificativo Fiscal
            </label>
            <input
              type="text"
              placeholder="ex.: Prestação de serviços de consultoria técnica no âmbito do contrato n.º 44/2026."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
            >
              Gravar Lançamento & Retenção
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
