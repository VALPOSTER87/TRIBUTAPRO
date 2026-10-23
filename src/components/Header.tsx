import React from 'react';
import { 
  Building2, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  FileSpreadsheet, 
  FileCheck, 
  AlertTriangle 
} from 'lucide-react';
import { UserProfile, OfflineSyncItem, TaxObligation } from '../types/tax';

interface HeaderProps {
  currentTab: 'retencoes' | 'guias' | 'calendario' | 'relatorios' | 'auditoria';
  setCurrentTab: (tab: 'retencoes' | 'guias' | 'calendario' | 'relatorios' | 'auditoria') => void;
  currentUser: UserProfile;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isOnline: boolean;
  toggleOnlineStatus: () => void;
  syncQueue: OfflineSyncItem[];
  isSyncing: boolean;
  triggerSync: () => void;
  onOpenNewRetentionModal: () => void;
  onOpenExcelModal: () => void;
  onOpenUserSwitchModal: () => void;
  obligations: TaxObligation[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  isDarkMode,
  setIsDarkMode,
  isOnline,
  toggleOnlineStatus,
  syncQueue,
  isSyncing,
  triggerSync,
  onOpenNewRetentionModal,
  onOpenExcelModal,
  onOpenUserSwitchModal,
  obligations,
}) => {
  const pendingCount = syncQueue.filter(q => q.status === 'pending').length;
  const urgentObligations = obligations.filter(o => o.status === 'proximo' || o.status === 'atrasado');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-sm font-semibold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                TributaPro AGT
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono -mt-0.5">
                Portal Fiscal & Retenções
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('retencoes')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'retencoes'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Lançamentos & Retenções
            </button>
            <button
              onClick={() => setCurrentTab('guias')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'guias'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Guias DAR & RUPE
            </button>
            <button
              onClick={() => setCurrentTab('calendario')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentTab === 'calendario'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <span>Vencimentos & Alertas</span>
              {urgentObligations.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title={`${urgentObligations.length} obrigações fiscais a vencer`} />
              )}
            </button>
            <button
              onClick={() => setCurrentTab('relatorios')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'relatorios'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Relatórios & AGT
            </button>
            {currentUser.permissions.canViewAuditLog && (
              <button
                onClick={() => setCurrentTab('auditoria')}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'auditoria'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Segurança & Auditoria
              </button>
            )}
          </nav>

          {/* Zone 3: Actions, Network Status & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Offline/Online toggle and sync badge */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                onClick={toggleOnlineStatus}
                title={isOnline ? 'Online (Clique para alternar teste offline)' : 'Modo Offline Ativo (Clique para reconectar)'}
                className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                  isOnline
                    ? 'text-emerald-700 dark:text-emerald-400 bg-white dark:bg-neutral-900 shadow-xs'
                    : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 font-semibold'
                }`}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isOnline ? 'Nuvem' : 'Offline'}</span>
              </button>

              {pendingCount > 0 && (
                <button
                  onClick={triggerSync}
                  disabled={!isOnline || isSyncing}
                  className="px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded flex items-center gap-1 transition-colors"
                  title="Sincronizar alterações pendentes com o servidor"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="tabular-nums font-mono">{pendingCount}</span>
                </button>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Alternar tema escuro/claro"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Import Excel button */}
            {currentUser.permissions.canImportExcel && (
              <button
                onClick={onOpenExcelModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel & CSV</span>
              </button>
            )}

            {/* New retention button */}
            {currentUser.permissions.canCalculateRetentions && (
              <button
                onClick={onOpenNewRetentionModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Retenção</span>
              </button>
            )}

            {/* User profile button */}
            <button
              onClick={onOpenUserSwitchModal}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
              title="Trocar utilizador ou verificar permissões"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
                  {currentUser.role}
                </span>
              </div>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
