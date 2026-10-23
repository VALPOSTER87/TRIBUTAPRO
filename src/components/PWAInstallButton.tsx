import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenMobileSetup: () => void;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenMobileSetup,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // If already installed and running standalone, show a badge or subtle status
  if (isInstalled) {
    return (
      <button
        onClick={onOpenMobileSetup}
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1.5 ${className}`}
        title="Aplicação instalada como PWA nativo"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">PWA Ativo</span>
      </button>
    );
  }

  // If directly installable via beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors flex items-center gap-1.5 ${className}`}
        title="Instalar no dispositivo móvel ou computador"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // Generic mobile setup trigger
  return (
    <button
      onClick={onOpenMobileSetup}
      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1.5 ${className}`}
      title="Configurar e testar no telemóvel (QR Code e PWA)"
    >
      <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span className="hidden sm:inline">Telemóvel & PWA</span>
    </button>
  );
};
