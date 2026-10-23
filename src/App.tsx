import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Layers, 
  Receipt, 
  CalendarDays, 
  FileText, 
  Plus, 
  Download, 
  ShieldCheck, 
  CloudCheck, 
  AlertTriangle,
  Calculator,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { 
  CompanyTaxProfile, 
  PaymentGuide, 
  RetentionEntry, 
  TaxObligation, 
  UserProfile, 
  AuditLogItem, 
  OfflineSyncItem, 
  DocumentAttachment 
} from './types/tax';
import { 
  INITIAL_COMPANY, 
  INITIAL_USERS, 
  INITIAL_TAX_OBLIGATIONS, 
  generateRUPE, 
  generateMulticaixaReference,
  TAX_DEFINITIONS,
  formatAOA 
} from './utils/taxConstants';
import { SAMPLE_RETENTIONS, SAMPLE_GUIDES } from './utils/sampleData';
import { exportRetentionsToExcel, exportRetentionsToCSV } from './utils/exportEngine';

import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { RetentionLedgerTable } from './components/RetentionLedgerTable';
import { GuidesManager } from './components/GuidesManager';
import { ObligationsCalendar } from './components/ObligationsCalendar';
import { ReportsView } from './components/ReportsView';
import { AuditLogView } from './components/AuditLogView';
import { TaxSimulationView } from './components/TaxSimulationView';
import { RetentionCalculatorModal } from './components/RetentionCalculatorModal';
import { ExcelManagerModal } from './components/ExcelManagerModal';
import { AccountingSyncModal } from './components/AccountingSyncModal';
import { RetentionCertificateModal } from './components/RetentionCertificateModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { UserRoleSwitcher } from './components/UserRoleSwitcher';
import { MobileTestSetupModal } from './components/MobileTestSetupModal';
import { PenDriveSetupModal } from './components/PenDriveSetupModal';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Network & Offline Sync State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncItem[]>(() => {
    try {
      const saved = localStorage.getItem('tributapro_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncBannerMessage, setSyncBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tributapro_sync_queue', JSON.stringify(syncQueue));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
  }, [syncQueue]);

  // Main Entities State
  const [company, setCompany] = useState<CompanyTaxProfile>(INITIAL_COMPANY);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // Eng. Carlos Mendes (Admin)
  const [currentTab, setCurrentTab] = useState<'retencoes' | 'guias' | 'calendario' | 'relatorios' | 'simulacao' | 'auditoria'>('retencoes');

  const [entries, setEntries] = useState<RetentionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('tributapro_entries');
      return saved ? JSON.parse(saved) : SAMPLE_RETENTIONS;
    } catch {
      return SAMPLE_RETENTIONS;
    }
  });

  const [guides, setGuides] = useState<PaymentGuide[]>(() => {
    try {
      const saved = localStorage.getItem('tributapro_guides');
      return saved ? JSON.parse(saved) : SAMPLE_GUIDES;
    } catch {
      return SAMPLE_GUIDES;
    }
  });

  const [obligations, setObligations] = useState<TaxObligation[]>(() => {
    try {
      const saved = localStorage.getItem('tributapro_obligations');
      return saved ? JSON.parse(saved) : INITIAL_TAX_OBLIGATIONS;
    } catch {
      return INITIAL_TAX_OBLIGATIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('tributapro_audit_logs');
      return saved ? JSON.parse(saved) : [
        {
          id: 'log_01',
          timestamp: '2026-10-20T08:14:00Z',
          userName: 'Dra. Maria Fernandes',
          userRole: 'Contabilista Sénior',
          action: 'Apuramento de Retenções na Fonte',
          details: 'Cálculo de retenções para faturas da SINFIC ANGOLA e SECURITAS.',
          ipAddress: '102.218.42.11',
          entityType: 'retention',
        },
        {
          id: 'log_02',
          timestamp: '2026-09-28T16:20:00Z',
          userName: 'Eng. Carlos Mendes',
          userRole: 'Administrador Fiscal',
          action: 'Emissão de Guia DAR AGT',
          details: 'Gerada Guia DAR-AGT-2026-10-0091 com RUPE 9820 2026 0928 4192 1084 no valor de Kz 2.392.000,00.',
          ipAddress: '102.218.42.10',
          entityType: 'guide',
        },
        {
          id: 'log_03',
          timestamp: '2026-09-29T14:15:00Z',
          userName: 'Dra. Maria Fernandes',
          userRole: 'Contabilista Sénior',
          action: 'Validação de Pagamento Bancário',
          details: 'Liquidação da Guia DAR-AGT-2026-09-0044 via Multicaixa BAI comprovativo anexado.',
          ipAddress: '102.218.42.11',
          entityType: 'guide',
        },
      ];
    } catch {
      return [];
    }
  });

  // LocalStorage persist
  useEffect(() => {
    localStorage.setItem('tributapro_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('tributapro_guides', JSON.stringify(guides));
  }, [guides]);

  useEffect(() => {
    localStorage.setItem('tributapro_obligations', JSON.stringify(obligations));
  }, [obligations]);

  useEffect(() => {
    localStorage.setItem('tributapro_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Selection for batch DAR generation
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);

  // Modals state
  const [isNewRetentionOpen, setIsNewRetentionOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [isMobileSetupOpen, setIsMobileSetupOpen] = useState(false);
  const [isMobilePreviewActive, setIsMobilePreviewActive] = useState(false);
  const [isPenDriveOpen, setIsPenDriveOpen] = useState(false);
  const [certificateEntry, setCertificateEntry] = useState<RetentionEntry | null>(null);
  const [documentViewEntry, setDocumentViewEntry] = useState<RetentionEntry | null>(null);

  // Helper to record audit events
  const addAuditLog = (action: string, details: string, entityType: AuditLogItem['entityType']) => {
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      action,
      details,
      ipAddress: '197.149.201.84',
      entityType,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Queue mutation for offline sync
  const enqueueSyncAction = (action: OfflineSyncItem['action'], payload: any) => {
    const syncItem: OfflineSyncItem = {
      id: `sync_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      payload,
      status: 'pending',
    };
    setSyncQueue(prev => [...prev, syncItem]);
  };

  // Trigger sync with cloud/server
  const handleTriggerSync = () => {
    if (!isOnline) {
      alert('Não é possível sincronizar em modo offline. Verifique a sua conexão de rede.');
      return;
    }

    setIsSyncing(true);
    setSyncBannerMessage('A sincronizar lançamentos pendentes com a base de dados central da nuvem...');

    setTimeout(() => {
      setSyncQueue([]);
      setIsSyncing(false);
      setSyncBannerMessage('Sincronização na nuvem concluída com sucesso! Todos os dados fiscais estão seguros.');
      addAuditLog('Sincronização em Nuvem', 'Sincronização de alterações locais com os servidores fiscais centrais.', 'config');
      setTimeout(() => setSyncBannerMessage(null), 4000);
    }, 1200);
  };

  // Handlers for Retention Entries
  const handleSaveNewEntry = (entry: RetentionEntry) => {
    setEntries(prev => [entry, ...prev]);
    enqueueSyncAction('create_entry', entry);
    addAuditLog(
      'Registo de Retenção',
      `Fatura ${entry.invoiceNumber} do fornecedor ${entry.supplierName} registrada com retenção de ${entry.appliedRate}% (${formatAOA(entry.retentionAmount)}).`,
      'retention'
    );
  };

  const handleDeleteEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    setEntries(prev => prev.filter(e => e.id !== id));
    setSelectedEntryIds(prev => prev.filter(item => item !== id));
    enqueueSyncAction('delete_entry', { id });
    if (entry) {
      addAuditLog(
        'Eliminação de Lançamento',
        `Lançamento da fatura ${entry.invoiceNumber} eliminado por ${currentUser.name}.`,
        'retention'
      );
    }
  };

  const handleToggleSelectEntry = (id: string) => {
    setSelectedEntryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedEntryIds(ids);
  };

  // Handlers for Guides
  const handleEmitGuideFromSelection = (selectedIds: string[]) => {
    const selected = entries.filter(e => selectedIds.includes(e.id));
    if (selected.length === 0) return;

    const rupe = generateRUPE();
    const mcRef = generateMulticaixaReference();
    const totalBase = selected.reduce((s, e) => s + e.taxBaseAmount, 0);
    const totalRet = selected.reduce((s, e) => s + e.retentionAmount, 0);
    const primaryTax = selected[0].taxType;

    const newGuide: PaymentGuide = {
      id: `guide_dar_${Date.now()}`,
      guideNumber: `DAR-AGT-${new Date().toISOString().slice(0, 7).replace('-', '/')}-${String(guides.length + 1).padStart(4, '0')}`,
      rupeCode: rupe,
      taxPeriod: new Date().toISOString().slice(0, 7),
      taxType: selected.every(e => e.taxType === primaryTax) ? primaryTax : 'CONSOLIDADA',
      taxTypeName: selected.every(e => e.taxType === primaryTax)
        ? TAX_DEFINITIONS[primaryTax]?.name || 'Retenções na Fonte'
        : 'Guia Consolidada de Retenções Fiscais AGT',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      totalTaxBase: totalBase,
      totalRetentionAmount: totalRet,
      entryIds: selectedIds,
      status: 'gerada',
      multicaixaEntity: '01001',
      multicaixaReference: mcRef,
      agtOffice: company.agtOffice,
      taxpayerName: company.companyName,
      taxpayerNIF: company.nif,
    };

    // Update entries status to 'em_guia'
    setEntries(prev => prev.map(e => {
      if (selectedIds.includes(e.id)) {
        return {
          ...e,
          status: 'em_guia',
          guideId: newGuide.id,
          rupeNumber: rupe,
        };
      }
      return e;
    }));

    setGuides(prev => [newGuide, ...prev]);
    setSelectedEntryIds([]);
    setCurrentTab('guias');
    enqueueSyncAction('emit_guide', newGuide);
    addAuditLog(
      'Emissão de Guia DAR / RUPE',
      `Guia ${newGuide.guideNumber} emitida com ${selectedIds.length} faturas agregadas no montante total de ${formatAOA(totalRet)}. RUPE: ${rupe}.`,
      'guide'
    );
  };

  const handleMarkGuidePaid = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    setGuides(prev => prev.map(g => {
      if (g.id === guideId) {
        return {
          ...g,
          status: 'paga',
          paidAt: new Date().toISOString(),
        };
      }
      return g;
    }));

    // Update entries to 'liquidado'
    setEntries(prev => prev.map(e => {
      if (guide.entryIds.includes(e.id)) {
        return { ...e, status: 'liquidado' };
      }
      return e;
    }));

    enqueueSyncAction('pay_guide', { guideId });
    addAuditLog(
      'Liquidação de Guia AGT',
      `Guia ${guide.guideNumber} liquidada junto do Estado com validação de comprovativo bancário.`,
      'guide'
    );
  };

  // Add imported entries from Excel/CSV
  const handleAddImportedEntries = (imported: RetentionEntry[]) => {
    setEntries(prev => [...imported, ...prev]);
    enqueueSyncAction('create_entry', imported);
    addAuditLog(
      'Importação em Lote de Planilha',
      `${imported.length} lançamentos fiscais importados via planilha Excel/CSV por ${currentUser.name}.`,
      'import'
    );
  };

  // Document attachment management
  const handleAddDocumentToEntry = (entryId: string, doc: DocumentAttachment) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return { ...e, documents: [...e.documents, doc] };
      }
      return e;
    }));
    addAuditLog(
      'Anexo de Fatura / Comprovativo',
      `Documento ${doc.name} anexado ao lançamento ${entryId}.`,
      'retention'
    );
  };

  const handleRemoveDocumentFromEntry = (entryId: string, docId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return { ...e, documents: e.documents.filter(d => d.id !== docId) };
      }
      return e;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isOnline={isOnline}
        toggleOnlineStatus={() => setIsOnline(!isOnline)}
        syncQueue={syncQueue}
        isSyncing={isSyncing}
        triggerSync={handleTriggerSync}
        onOpenNewRetentionModal={() => setIsNewRetentionOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenUserSwitchModal={() => setIsUserSwitchOpen(true)}
        onOpenMobileSetup={() => setIsMobileSetupOpen(true)}
        obligations={obligations}
      />

      {/* Sync Status Banner */}
      {syncBannerMessage && (
        <div className="no-print bg-amber-500 text-neutral-950 font-semibold px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <span>{syncBannerMessage}</span>
        </div>
      )}

      {/* Mobile Simulator Mode Banner if active on desktop */}
      {isMobilePreviewActive && (
        <div className="no-print max-w-md mx-auto my-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Simulador Telemóvel Ativo (390px):</strong> Vista fiel para smartphone.</span>
          </div>
          <button
            onClick={() => setIsMobilePreviewActive(false)}
            className="px-2 py-1 text-[11px] font-bold bg-white dark:bg-neutral-900 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
          >
            Sair
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-200 ${
        isMobilePreviewActive 
          ? 'max-w-[420px] border-x-4 border-y-8 border-neutral-800 dark:border-neutral-700 rounded-[44px] shadow-2xl bg-neutral-50 dark:bg-neutral-950 my-4 overflow-hidden' 
          : 'max-w-7xl'
      }`}>
        
        {/* Workspace Sub-Header Toolbar */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
              <span>{company.companyName}</span>
              <span aria-hidden="true">·</span>
              <span>NIF: {company.nif}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{company.agtOffice}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
              {currentTab === 'retencoes' && 'Gestão de Faturas & Retenções Fiscais'}
              {currentTab === 'guias' && 'Guias de Arrecadação de Receitas (DAR & RUPE)'}
              {currentTab === 'calendario' && 'Calendário Tributário & Alertas de Vencimento'}
              {currentTab === 'relatorios' && 'Relatórios Fiscais Mensais & Declarações AGT'}
              {currentTab === 'simulacao' && 'Simulação Fiscal Avançada & Comparativo de Regimes'}
              {currentTab === 'auditoria' && 'Registo de Atividades & Trilha de Auditoria'}
            </h1>
          </div>

          {/* Quick ERP & System Integrators */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPenDriveOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Versão portátil para gravar e partilhar em Pen Drive USB"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Versão Pen Drive USB</span>
            </button>
            <button
              onClick={() => setIsMobileSetupOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Abrir no smartphone via QR Code ou instalar PWA"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Instalar no Telemóvel</span>
            </button>
            <button
              onClick={() => setCurrentTab('simulacao')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                currentTab === 'simulacao'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Simulador de Regimes</span>
            </button>
            <button
              onClick={() => setIsAccountingModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Sistemas Contabilísticos (Primavera/PHC/SAP)</span>
            </button>
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Planilhas Excel & AGT</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Ribbon */}
        <div className="no-print">
          <MetricCards
            entries={entries}
            guides={guides}
            obligations={obligations}
            onSelectTab={(tab) => setCurrentTab(tab)}
          />
        </div>

        {/* Tab 1: Retenções & Lançamentos */}
        {currentTab === 'retencoes' && (
          <RetentionLedgerTable
            entries={entries}
            currentUser={currentUser}
            selectedEntryIds={selectedEntryIds}
            onToggleSelectEntry={handleToggleSelectEntry}
            onSelectAll={handleSelectAll}
            onEmitGuideFromSelection={handleEmitGuideFromSelection}
            onDeleteEntry={handleDeleteEntry}
            onOpenDocumentModal={(entry) => setDocumentViewEntry(entry)}
            onOpenCertificateModal={(entry) => setCertificateEntry(entry)}
            onExportExcel={() => exportRetentionsToExcel(entries, company)}
            onExportCSV={() => exportRetentionsToCSV(entries)}
          />
        )}

        {/* Tab 2: Guias DAR & RUPE */}
        {currentTab === 'guias' && (
          <GuidesManager
            guides={guides}
            entries={entries}
            company={company}
            currentUser={currentUser}
            onMarkGuidePaid={handleMarkGuidePaid}
          />
        )}

        {/* Tab 3: Calendário e Alertas */}
        {currentTab === 'calendario' && (
          <ObligationsCalendar
            obligations={obligations}
            entries={entries}
            currentUser={currentUser}
            onEmitGuideForTax={(category) => {
              const eligible = entries.filter(e => e.status === 'pendente');
              if (eligible.length > 0) {
                handleEmitGuideFromSelection(eligible.map(e => e.id));
              } else {
                alert(`Nenhuma retenção pendente de apuramento para ${category}.`);
              }
            }}
            onMarkObligationDone={(id) => {
              setObligations(prev => prev.map(o => o.id === id ? { ...o, status: 'concluido' } : o));
              addAuditLog('Cumprimento de Obrigação', `Obrigação fiscal ${id} marcada como cumprida.`, 'config');
            }}
          />
        )}

        {/* Tab 4: Relatórios & AGT */}
        {currentTab === 'relatorios' && (
          <ReportsView
            entries={entries}
            company={company}
            currentUser={currentUser}
          />
        )}

        {/* Tab 5: Simulação Fiscal de Regimes */}
        {currentTab === 'simulacao' && (
          <TaxSimulationView
            company={company}
            currentUser={currentUser}
          />
        )}

        {/* Tab 6: Segurança e Auditoria */}
        {currentTab === 'auditoria' && (
          <AuditLogView
            logs={auditLogs}
            currentUser={currentUser}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-neutral-200 dark:border-neutral-800 py-6 mt-12 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">TributaPro AGT</span>
            <span aria-hidden="true">·</span>
            <span>Sistema Integrado de Gestão Fiscal & Retenções na Fonte</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Legislação Angolana (Lei 26/20, CIVA, CIRT)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Sessão: <strong className="text-neutral-800 dark:text-neutral-200">{currentUser.name}</strong></span>
            <span aria-hidden="true">·</span>
            <span>{isOnline ? 'Sincronização em Nuvem Ativa' : 'Trabalho em Modo Offline Local'}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RetentionCalculatorModal
        isOpen={isNewRetentionOpen}
        onClose={() => setIsNewRetentionOpen(false)}
        onSaveEntry={handleSaveNewEntry}
        currentUser={currentUser}
      />

      <ExcelManagerModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        entries={entries}
        company={company}
        currentUser={currentUser}
        onAddImportedEntries={handleAddImportedEntries}
      />

      <AccountingSyncModal
        isOpen={isAccountingModalOpen}
        onClose={() => setIsAccountingModalOpen(false)}
        entries={entries}
        company={company}
        currentUser={currentUser}
      />

      <RetentionCertificateModal
        isOpen={!!certificateEntry}
        onClose={() => setCertificateEntry(null)}
        entry={certificateEntry}
        company={company}
      />

      <DocumentViewerModal
        isOpen={!!documentViewEntry}
        onClose={() => setDocumentViewEntry(null)}
        entry={documentViewEntry}
        onAddDocument={handleAddDocumentToEntry}
        onRemoveDocument={handleRemoveDocumentFromEntry}
      />

      <UserRoleSwitcher
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
        currentUser={currentUser}
        availableUsers={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          addAuditLog('Troca de Utilizador', `Sessão alternada para ${u.name} (${u.roleTitle}).`, 'user');
        }}
      />

      <MobileTestSetupModal
        isOpen={isMobileSetupOpen}
        onClose={() => setIsMobileSetupOpen(false)}
        onToggleMobilePreviewMode={() => setIsMobilePreviewActive(!isMobilePreviewActive)}
        isMobilePreviewActive={isMobilePreviewActive}
      />

      <PenDriveSetupModal
        isOpen={isPenDriveOpen}
        onClose={() => setIsPenDriveOpen(false)}
        entries={entries}
        guides={guides}
        company={company}
        auditLogs={auditLogs}
        onRestoreBackup={(restored) => {
          if (restored.entries) setEntries(restored.entries);
          if (restored.guides) setGuides(restored.guides);
          if (restored.company) setCompany(restored.company);
          addAuditLog('Restauração de Dados', 'Backup restaurado com sucesso a partir de ficheiro USB.', 'config');
        }}
      />

    </div>
  );
}
