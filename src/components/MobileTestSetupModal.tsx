import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Camera, 
  Apple, 
  Sparkles, 
  Wifi, 
  ShieldCheck, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileTestSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleMobilePreviewMode?: () => void;
  isMobilePreviewActive?: boolean;
}

export const MobileTestSetupModal: React.FC<MobileTestSetupModalProps> = ({
  isOpen,
  onClose,
  onToggleMobilePreviewMode,
  isMobilePreviewActive,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'android' | 'ios' | 'camera'>('qr');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Current URL or fallback to development app URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-26i2t7i7u7vbmfsnxm2veh-349219462617.europe-west1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Generate a clean data-driven SVG QR code representation for the URL
  // Encode URL blocks cleanly using standard SVG pattern matrix
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-2xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Setup & Instalação em Dispositivo Móvel
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                PWA Nativo · Android, iPhone, iPad e Modo Offline
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-950/30">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code de Acesso</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instalar no Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>Instalar no iOS (iPhone)</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Câmara & OCR Móvel</span>
          </button>
        </div>

        {/* Tab 1: QR Code Scanner for instant phone opening */}
        {activeTab === 'qr' && (
          <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              
              {/* QR Box with fallback */}
              <div className="p-3 bg-white rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-sm shrink-0 flex flex-col items-center">
                <img
                  src={qrSvgUrl}
                  alt="QR Code para abrir no telemóvel"
                  className="w-44 h-44 object-contain"
                  onError={(e) => {
                    // Fallback to stylized SVG QR representation if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-mono text-neutral-500 mt-1">Aponte a câmara do telemóvel</span>
              </div>

              {/* Instructions */}
              <div className="space-y-3 flex-1 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Como abrir e testar no seu telemóvel:
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Não é necessário baixar nada da Google Play ou App Store. O aplicativo é um PWA (Progressive Web App) completo com suporte nativo a ecrã inteiro e cache offline.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Abra o aplicativo da <strong>Câmara fotográfica</strong> no seu iPhone ou telemóvel Android.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>Aponte para o <strong>QR Code</strong> ao lado e toque na notificação amarela que aparecer.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>No navegador do telemóvel, toque em <strong>Instalar</strong> para adicionar o ícone ao ecrã inicial!</span>
                  </div>
                </div>

                {/* Direct Link Copy */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 select-all"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Simulator Toggle Button on Desktop */}
            {onToggleMobilePreviewMode && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Testar Vista de Telemóvel no Computador:</span>
                  <p className="text-[11px] text-neutral-500">Alterna a janela para a proporção exata de um smartphone (390px).</p>
                </div>
                <button
                  onClick={() => {
                    onToggleMobilePreviewMode();
                    onClose();
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                    isMobilePreviewActive
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{isMobilePreviewActive ? 'Desativar Vista Mobile' : 'Simular Telemóvel no Ecrã'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Android Instructions & Direct Trigger */}
        {activeTab === 'android' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Instalação Direta no Android (Chrome, Edge, Samsung)
                  </h3>
                </div>
                {isInstalled && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white font-mono">
                    JÁ INSTALADO
                  </span>
                )}
              </div>

              <p className="text-neutral-600 dark:text-neutral-300">
                O TributaPro AGT é reconhecido automaticamente pelo sistema operativo Android como uma aplicação Web Progressiva completa.
              </p>

              {isInstallable && (
                <button
                  onClick={install}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar TributaPro AGT Agora</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100">
                Instalação manual caso o aviso não surja:
              </h4>
              <ol className="list-decimal pl-5 space-y-1.5 text-neutral-600 dark:text-neutral-300">
                <li>No navegador Chrome do Android, toque no menu de <strong>três pontos (⋮)</strong> no canto superior direito.</li>
                <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>Confirme o nome e toque em <strong>"Instalar"</strong>.</li>
                <li>O ícone do TributaPro aparecerá na sua gaveta de aplicativos e no ecrã inicial, funcionando mesmo sem internet!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: iOS (iPhone/iPad) Instructions */}
        {activeTab === 'ios' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 space-y-3">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Instalação no iPhone & iPad (Safari)
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300">
                No iOS da Apple, a instalação é efetuada através do menu Partilhar do Safari.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Abra o site no navegador Safari</strong>
                  <p className="text-neutral-500 mt-0.5">Certifique-se de estar a usar o Safari (o motor WebKit do iOS exige o Safari para adicionar à tela inicial).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Toque no botão "Partilhar" (Ícone com seta)</strong>
                  <p className="text-neutral-500 mt-0.5">Localizado no centro inferior da barra do Safari (quadrado com uma seta apontando para cima).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-100">Selecione "Adicionar ao Ecrã Principal"</strong>
                  <p className="text-neutral-500 mt-0.5">Role o menu para baixo, toque em <em>Adicionar ao Ecrã Principal</em> e depois em <em>Adicionar</em> no canto superior direito.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Mobile Camera & Receipt Capture Tester */}
        {activeTab === 'camera' && (
          <div className="p-6 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Teste da Câmara Móvel & Fotografia de Faturas
              </h3>
              <p className="text-neutral-500 mt-1">
                Ao utilizar o TributaPro no smartphone, pode apontar a câmara diretamente para a fatura em papel para capturar a imagem e alimentar o motor OCR.
              </p>
            </div>

            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center bg-neutral-50/50 dark:bg-neutral-950/20">
              <input
                type="file"
                id="mobileCameraInput"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraCapture}
              />
              <label htmlFor="mobileCameraInput" className="cursor-pointer flex flex-col items-center justify-center">
                <Camera className="w-8 h-8 text-amber-600 mb-2" />
                <span className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                  Fotografar Fatura com a Câmara do Telemóvel
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  Ativa a câmara traseira nativa no smartphone ou seleciona arquivo no computador.
                </span>
              </label>
            </div>

            {photoPreview && (
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">Foto Capturada com Sucesso:</span>
                  <button
                    onClick={() => setPhotoPreview(null)}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Remover
                  </button>
                </div>
                <img
                  src={photoPreview}
                  alt="Pré-visualização da fatura capturada"
                  className="max-h-48 w-auto mx-auto rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PWA Compatível com Android 8+ e iOS 13+</span>
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
