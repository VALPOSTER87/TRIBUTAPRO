import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  Terminal,
  Lock,
  Download
} from 'lucide-react';
import { AuditLogItem, UserProfile } from '../types/tax';
import { downloadFile } from '../utils/exportEngine';

interface AuditLogViewProps {
  logs: AuditLogItem[];
  currentUser: UserProfile;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = filterEntity === 'all' || log.entityType === filterEntity;
    return matchesSearch && matchesEntity;
  });

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Utilizador', 'Funcao', 'Acao', 'Detalhes', 'IP', 'Tipo'];
    const rows = logs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.entityType,
    ]);
    const content = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    downloadFile(content, `Trilha_Auditoria_Fiscal_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Trilha de Auditoria & Conformidade Fiscal
            </h2>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Registo imutável de todas as ações de cálculo de retenções, emissão de guias DAR/RUPE, importações em lote e exportações de dados fiscais.
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Log de Auditoria (.csv)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Pesquisar por utilizador, ação ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Filtrar Categoria:</span>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            aria-label="Filtrar eventos por categoria"
            className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
          >
            <option value="all">Todas as Operações</option>
            <option value="retention">Retenções & Faturas</option>
            <option value="guide">Guias DAR / RUPE</option>
            <option value="import">Importações Excel</option>
            <option value="export">Exportações & SAF-T</option>
            <option value="user">Sessões & Utilizadores</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="py-2.5 px-3">Data & Hora</th>
                <th className="py-2.5 px-3">Utilizador & Cargo</th>
                <th className="py-2.5 px-3">Operação / Ação</th>
                <th className="py-2.5 px-3">Detalhes do Evento</th>
                <th className="py-2.5 px-3 text-right">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap text-neutral-500">
                    {new Date(log.timestamp).toLocaleString('pt-AO')}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{log.userName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{log.userRole}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{log.action}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-neutral-600 dark:text-neutral-300 max-w-md truncate">
                    {log.details}
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
