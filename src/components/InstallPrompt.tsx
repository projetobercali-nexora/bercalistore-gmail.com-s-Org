import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BrandLogo } from './BrandLogo';

export const InstallPrompt: React.FC = () => {
  const location = useLocation();
  const {
    isInstalled,
    isInstallableNatively,
    isIOS,
    shouldShowTimedInvite,
    triggerNativeInstall,
    dismissPrompt,
  } = usePWAInstall(location.pathname);

  const [showInstructions, setShowInstructions] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallAction = async () => {
    if (isInstallableNatively) {
      const outcome = await triggerNativeInstall();
      if (outcome === 'unavailable') {
        setShowInstructions(true);
      }
      return;
    }
    setShowInstructions(true);
  };

  return (
    <>
      {shouldShowTimedInvite && !showInstructions && (
        <aside
          aria-label="Convite para instalar a aplicação Bercali Store"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-40 rounded-xl bg-[#1A1A1A] border border-white/15 p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <BrandLogo size="compact" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm font-bold text-white">
                Adiciona a Bercali Store ao teu ecrã
              </p>
              <p className="mt-1 text-xs text-[#8A8A8A] leading-relaxed">
                Acede mais depressa ao catálogo sempre que precisares, sem ocupar espaço desnecessário.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleInstallAction()}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#FF8A00] px-3.5 py-2 font-display text-xs font-bold uppercase text-[#0A0A0A] hover:bg-[#FFC400] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Instalar</span>
                </button>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
                >
                  Agora não
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissPrompt}
              aria-label="Dispensar convite de instalação"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#8A8A8A] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}

      {showInstructions && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Como instalar a Bercali Store no dispositivo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-[#1A1A1A] border border-white/15 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="compact" />
                <h3 className="font-display text-base font-bold text-white">
                  Adicionar ao ecrã principal
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Fechar instruções de instalação"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#8A8A8A] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-sm text-white/90 leading-relaxed">
                <p>No iPhone ou iPad através do Safari:</p>
                <ol className="list-decimal pl-5 space-y-2 text-[#8A8A8A]">
                  <li>
                    Toca no botão <strong className="text-white inline-flex items-center gap-1"><Share className="h-3.5 w-3.5 inline text-[#FF8A00]" /> Partilhar</strong> na barra do Safari.
                  </li>
                  <li>
                    Desliza as opções e seleciona <strong className="text-white">Adicionar ao ecrã principal</strong>.
                  </li>
                  <li>
                    Confirma em <strong className="text-white">Adicionar</strong> no canto superior.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-white/90 leading-relaxed">
                <p>No Android ou computador (Chrome / Edge):</p>
                <ol className="list-decimal pl-5 space-y-2 text-[#8A8A8A]">
                  <li>
                    Abre o menu do navegador (ícone de três pontos no canto superior).
                  </li>
                  <li>
                    Seleciona <strong className="text-white">Instalar aplicação</strong> ou{' '}
                    <strong className="text-white">Adicionar ao ecrã principal</strong>.
                  </li>
                </ol>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowInstructions(false);
                  dismissPrompt();
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#FF8A00] px-5 py-2.5 font-display text-xs font-bold uppercase text-[#0A0A0A] cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
