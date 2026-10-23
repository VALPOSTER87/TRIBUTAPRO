import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileCheck2, 
  Download, 
  Trash2, 
  FileText, 
  Receipt, 
  Layers,
  Award,
  ChevronRight,
  Eye
} from 'lucide-react';
import { RetentionEntry, TaxType, UserProfile } from '../types/tax';
import { TAX_DEFINITIONS, formatAOA } from '../utils/taxConstants';

interface RetentionLedgerTableProps {
  entries: RetentionEntry[];
  currentUser: UserProfile;
  selectedEntryIds: string[];
  onToggleSelectEntry: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onEmitGuideFromSelection: (selectedIds: string[]) => void;
  onDeleteEntry: (id: string) => void;
  onOpenDocumentModal: (entry: RetentionEntry) => void;
  onOpenCertificateModal: (entry: RetentionEntry) => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export const RetentionLedgerTable: React.FC<RetentionLedgerTableProps> = ({
  entries,
  currentUser,
  selectedEntryIds,
  onToggleSelectEntry,
  onSelectAll,
  onEmitGuideFromSelection,
  onDeleteEntry,
  onOpenDocumentModal,
  onOpenCertificateModal,
  onExportExcel,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'em_guia' | 'liquidado'>('todos');
  const [taxFilter, setTaxFilter] = useState<string>('todos');

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.supplierNIF.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || entry.status === statusFilter;
    const matchesTax = taxFilter === 'todos' || entry.taxType === taxFilter;

    return matchesSearch && matchesStatus && matchesTax;
  });

  const allFilteredSelected = 
    filteredEntries.length > 0 &&
    filteredEntries.every(e => selectedEntryIds.includes(e.id));

  const handleSelectAllToggle = () => {
    if (allFilteredSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(filteredEntries.map(e => e.id));
    }
  };

  const selectedCount = selectedEntryIds.length;
  const selectedEntries = entries.filter(e => selectedEntryIds.includes(e.id));
  const selectedTotalRetention = selectedEntries.reduce((sum, e) => sum + e.retentionAmount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
      
      {/* Table Header Controls */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-950/20">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Pesquisar por fornecedor, NIF ou fatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Right: Filters & Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status selector */}
          <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800 p-1 rounded-lg">
            {(['todos', 'pendente', 'em_guia', 'liquidado'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                  statusFilter === status
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {status === 'todos' ? 'Todos' : status === 'em_guia' ? 'Em Guia' : status}
              </button>
            ))}
          </div>

          {/* Tax type select */}
          <select
            value={taxFilter}
            onChange={(e) => setTaxFilter(e.target.value)}
            aria-label="Filtrar por tipo de retenção fiscal"
            className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="todos">Todos os Impostos</option>
            {Object.keys(TAX_DEFINITIONS).map(key => (
              <option key={key} value={key}>{TAX_DEFINITIONS[key as TaxType].shortName}</option>
            ))}
          </select>

          {/* Export buttons */}
          <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-2">
            <button
              onClick={onExportExcel}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              title="Exportar tabela para Excel (.xlsx)"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>XLSX</span>
            </button>
            <button
              onClick={onExportCSV}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              title="Exportar dados para CSV delimitado"
            >
              <Download className="w-3 h-3 text-neutral-500" />
              <span>CSV</span>
            </button>
          </div>

        </div>

      </div>

      {/* Floating Selection Batch Action Bar */}
      {selectedCount > 0 && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>
              <strong className="font-mono tabular-nums">{selectedCount}</strong> {selectedCount === 1 ? 'fatura selecionada' : 'faturas selecionadas'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Total Retido: <strong className="font-mono tabular-nums">{formatAOA(selectedTotalRetention)}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.permissions.canEmitGuides && (
              <button
                onClick={() => onEmitGuideFromSelection(selectedEntryIds)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Emitir Guia DAR / RUPE ({selectedCount})</span>
              </button>
            )}
            <button
              onClick={() => onSelectAll([])}
              className="px-2.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:underline"
            >
              Desmarcar Todas
            </button>
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 font-semibold select-none">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Selecionar todas as faturas filtradas"
                  checked={allFilteredSelected}
                  onChange={handleSelectAllToggle}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </th>
              <th className="py-2.5 px-3">Fornecedor / NIF</th>
              <th className="py-2.5 px-3">Fatura / Data</th>
              <th className="py-2.5 px-3">Imposto & Taxa</th>
              <th className="py-2.5 px-3 text-right">Base Tributável (Kz)</th>
              <th className="py-2.5 px-3 text-right">Retenção (Kz)</th>
              <th className="py-2.5 px-3 text-right">Líquido a Pagar</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3 text-center">Anexos</th>
              <th className="py-2.5 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Nenhum lançamento fiscal encontrado
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {searchTerm || statusFilter !== 'todos' || taxFilter !== 'todos'
                        ? 'Tente ajustar os critérios de pesquisa ou filtros aplicados.'
                        : 'Comece clicando em "Nova Retenção" ou importe uma planilha Excel.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = selectedEntryIds.includes(entry.id);
                const taxDef = TAX_DEFINITIONS[entry.taxType];

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors ${
                      isSelected ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Selecionar fatura ${entry.invoiceNumber} de ${entry.supplierName}`}
                        checked={isSelected}
                        onChange={() => onToggleSelectEntry(entry.id)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                        {entry.supplierName}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>NIF: {entry.supplierNIF}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{entry.supplierType}</span>
                      </div>
                    </td>

                    {/* Invoice */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                        {entry.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                        {entry.invoiceDate}
                      </div>
                    </td>

                    {/* Tax & Rate */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {taxDef?.shortName || entry.taxType}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                        Taxa: {entry.appliedRate}%
                      </div>
                    </td>

                    {/* Gross */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                      {formatAOA(entry.taxBaseAmount)}
                    </td>

                    {/* Retention */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                      {formatAOA(entry.retentionAmount)}
                    </td>

                    {/* Net Payable */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                      {formatAOA(entry.netPayableAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <div className="text-xs font-medium">
                        {entry.status === 'pendente' && (
                          <span className="text-amber-600 dark:text-amber-400">Pendente</span>
                        )}
                        {entry.status === 'em_guia' && (
                          <span className="text-blue-600 dark:text-blue-400">Em Guia DAR</span>
                        )}
                        {entry.status === 'liquidado' && (
                          <span className="text-emerald-600 dark:text-emerald-400">Liquidado</span>
                        )}
                        {entry.status === 'atrasado' && (
                          <span className="text-red-600 dark:text-red-400">Atrasado</span>
                        )}
                      </div>
                      {entry.rupeNumber && (
                        <div className="text-[10px] text-neutral-500 font-mono truncate max-w-[120px]">
                          {entry.rupeNumber}
                        </div>
                      )}
                    </td>

                    {/* Documents */}
                    <td className="py-3 px-3 text-center">
                      {entry.documents.length > 0 ? (
                        <button
                          onClick={() => onOpenDocumentModal(entry)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-mono"
                          title="Visualizar fatura e comprovativos anexados"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                          <span>{entry.documents.length}</span>
                        </button>
                      ) : (
                        <span className="text-neutral-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Certificate button */}
                        <button
                          onClick={() => onOpenCertificateModal(entry)}
                          className="p-1.5 text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Gerar Certificado Oficial de Retenção para o Fornecedor"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete entry if permission allows */}
                        {currentUser.permissions.canDeleteRecords && (
                          <button
                            onClick={() => {
                              if (confirm(`Pretende eliminar a retenção da fatura ${entry.invoiceNumber}?`)) {
                                onDeleteEntry(entry.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Eliminar lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div>
          Total de <strong className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100">{filteredEntries.length}</strong> registos filtrados
        </div>
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <span>Base Total: <strong>{formatAOA(filteredEntries.reduce((s, e) => s + e.taxBaseAmount, 0))}</strong></span>
          <span>Retenção Total: <strong className="text-amber-600 dark:text-amber-400">{formatAOA(filteredEntries.reduce((s, e) => s + e.retentionAmount, 0))}</strong></span>
        </div>
      </div>

    </div>
  );
};
