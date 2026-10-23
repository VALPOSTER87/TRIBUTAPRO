import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  Check, 
  FileArchive, 
  Terminal, 
  Smartphone, 
  ShieldCheck, 
  Copy, 
  Laptop, 
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CompanyTaxProfile, PaymentGuide, RetentionEntry, AuditLogItem } from '../types/tax';
import { downloadFile } from '../utils/exportEngine';

interface PenDriveSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RetentionEntry[];
  guides: PaymentGuide[];
  company: CompanyTaxProfile;
  auditLogs: AuditLogItem[];
  onRestoreBackup: (data: {
    entries?: RetentionEntry[];
    guides?: PaymentGuide[];
    company?: CompanyTaxProfile;
  }) => void;
}

export const PenDriveSetupModal: React.FC<PenDriveSetupModalProps> = ({
  isOpen,
  onClose,
  entries,
  guides,
  company,
  auditLogs,
  onRestoreBackup,
}) => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Export backup data to JSON file for USB drive
  const handleExportDataBackup = () => {
    const backupData = {
      version: '2026.4',
      exportDate: new Date().toISOString(),
      company,
      entriesCount: entries.length,
      guidesCount: guides.length,
      entries,
      guides,
      auditLogs,
    };
    downloadFile(
      JSON.stringify(backupData, null, 2),
      `BACKUP_PENDRIVE_TRIBUTAPRO_${company.nif}_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;'
    );
  };

  // 2. Import backup from USB drive
  const handleImportDataBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.entries && Array.isArray(parsed.entries)) {
          onRestoreBackup({
            entries: parsed.entries,
            guides: parsed.guides,
            company: parsed.company,
          });
          setRestoreStatus(`Restaurado com sucesso! ${parsed.entries.length} retenções recuperadas.`);
          setTimeout(() => setRestoreStatus(null), 4000);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err: any) {
        alert(`Erro ao ler arquivo de backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-3xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Central Pen Drive & Portabilidade 100% Offline
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Pasta Autossuficiente para Gravação em USB e Partilha Local
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Main Action Banner: Download Zip */}
          <div className="p-5 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                <FileArchive className="w-3.5 h-3.5" />
                <span>Pacote Pronto para Pen Drive (.ZIP)</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Descarregar Versão Offline Portátil
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 max-w-lg leading-relaxed">
                Contém a pasta completa <strong>PENDRIVE_TRIBUTAPRO_OFFLINE</strong> com todos os scripts, páginas, ícones e executáveis 1-clique para Windows, Mac e Linux. Basta extrair na sua Pen Drive!
              </p>
            </div>

            <a
              href="/TributaPro_PenDrive_Offline.zip"
              download="TributaPro_PenDrive_Offline.zip"
              className="px-4 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Descarregar Pacote ZIP</span>
            </a>
          </div>

          {/* Location in Workspace info */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">Pasta criada no projeto:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">/PENDRIVE_TRIBUTAPRO_OFFLINE/</span>
            </div>
            <p className="font-sans text-xs text-neutral-500">
              Esta pasta foi gerada e está pronta no diretório raiz do projeto. Pode copiar todo o seu conteúdo diretamente para qualquer unidade USB.
            </p>
          </div>

          {/* Launchers Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
              Arquivos de Inicialização Inclusos na Pen Drive
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Windows Launcher */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 font-mono">
                    INICIAR_TRIBUTAPRO_WINDOWS.bat
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    Windows
                  </span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Basta dar duplo clique em qualquer PC com Windows 10 ou 11. O script utiliza o PowerShell nativo ou Python embutido para ligar o servidor local e abrir o navegador automaticamente.
                </p>
              </div>

              {/* Mac/Linux Launcher */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 font-mono">
                    INICIAR_TRIBUTAPRO_MAC_LINUX.sh
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-mono">
                    macOS & Linux
                  </span>
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Script shell executável que detecta Python ou Node para abrir o aplicativo de imediato em <code>http://localhost:8080</code>.
                </p>
              </div>

            </div>
          </div>

          {/* How to test on Mobile without internet from Pen Drive */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                Como Testar e Usar no Telemóvel a partir da Pen Drive (Sem Internet)
              </h4>
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-700 dark:text-neutral-300 text-xs">
              <li>Ligue a Pen Drive ao computador portátil e execute o arquivo <code>INICIAR_TRIBUTAPRO_WINDOWS.bat</code>.</li>
              <li>Ative o <strong>Hotspot / Ponto de Acesso Móvel</strong> do seu telemóvel e ligue o computador a essa rede Wi-Fi (não gasta dados de internet!).</li>
              <li>No computador, veja o endereço IP da rede local (ex: <code>192.168.43.15</code>).</li>
              <li>No navegador do telemóvel, abra: <strong><code>http://[IP-DO-COMPUTADOR]:8080</code></strong>.</li>
              <li>O TributaPro carrega no telemóvel e pode ser instalado no ecrã inicial!</li>
            </ol>
          </div>

          {/* Database Backup & Restore for USB storage */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                  Cópia de Segurança dos Dados Fiscais para a Pen Drive
                </h4>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  Guarde um arquivo <code>.json</code> com todos os lançamentos, guias emitidas e configurações para restaurar em qualquer computador.
                </p>
              </div>
            </div>

            {restoreStatus && (
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {restoreStatus}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleExportDataBackup}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Salvar Cópia dos Dados (.JSON)</span>
              </button>

              <label className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-200 dark:border-neutral-700">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restaurar Dados da Pen Drive</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportDataBackup}
                />
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Versão Pen Drive Standalone · 100% Compatível com Execução Local</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
