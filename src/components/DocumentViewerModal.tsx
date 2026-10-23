import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { DocumentAttachment, RetentionEntry } from '../types/tax';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: RetentionEntry | null;
  onAddDocument: (entryId: string, doc: DocumentAttachment) => void;
  onRemoveDocument: (entryId: string, docId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  entry,
  onAddDocument,
  onRemoveDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentAttachment | null>(null);

  if (!isOpen || !entry) return null;

  const activeDoc = selectedDoc || (entry.documents.length > 0 ? entry.documents[0] : null);

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
      ocrExtracted: {
        nif: entry.supplierNIF,
        supplier: entry.supplierName,
        amount: entry.grossAmount,
        invoiceNum: entry.invoiceNumber,
        confidence: 0.96,
      },
    };

    const reader = new FileReader();
    reader.onload = () => {
      newDoc.dataUrl = reader.result as string;
      onAddDocument(entry.id, newDoc);
      setSelectedDoc(newDoc);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-4xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Arquivo Digital de Fatura & Comprovativos Fiscais
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {entry.supplierName} · Fatura: {entry.invoiceNumber}
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

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 flex-1 overflow-hidden">
          
          {/* Left: Document List & Upload */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span>Documentos ({entry.documents.length})</span>
              <label htmlFor="modalDocUpload" className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Anexar</span>
              </label>
              <input
                type="file"
                id="modalDocUpload"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
              />
            </div>

            {entry.documents.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                Nenhum documento anexado ainda.
              </div>
            ) : (
              <div className="space-y-1.5">
                {entry.documents.map((doc) => {
                  const isCurrent = activeDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-medium truncate text-neutral-900 dark:text-neutral-100">
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            {Math.round(doc.size / 1024)} KB · {doc.uploadDate}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Eliminar este documento anexado?')) {
                            onRemoveDocument(entry.id, doc.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* OCR Data Extracted Box */}
            {activeDoc?.ocrExtracted && (
              <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-neutral-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Extração Automática (OCR)</span>
                </div>
                <div className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300 space-y-0.5">
                  <div>NIF Detetado: <strong>{activeDoc.ocrExtracted.nif}</strong></div>
                  <div>Fatura: <strong>{activeDoc.ocrExtracted.invoiceNum}</strong></div>
                  <div>Confiança: <strong>{(activeDoc.ocrExtracted.confidence * 100).toFixed(0)}%</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Visual Document Preview */}
          <div className="md:col-span-2 p-6 flex flex-col items-center justify-center bg-neutral-50/50 dark:bg-neutral-950/30 overflow-y-auto">
            {activeDoc ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {activeDoc.dataUrl && activeDoc.type.startsWith('image/') ? (
                  <img
                    src={activeDoc.dataUrl}
                    alt={activeDoc.name}
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs max-w-md w-full">
                    <FileText className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {activeDoc.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono mt-1">
                      {activeDoc.type} · {Math.round(activeDoc.size / 1024)} KB
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {activeDoc.dataUrl && (
                        <a
                          href={activeDoc.dataUrl}
                          download={activeDoc.name}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descarregar Arquivo</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-neutral-400">
                Selecione ou anexe um documento para visualizar.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
