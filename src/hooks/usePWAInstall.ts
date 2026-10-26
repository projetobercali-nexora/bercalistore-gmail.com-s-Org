import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_STORAGE_KEY = 'bercali_pwa_install_dismissed_v1';
const INSTALL_PROMPT_DELAY_MS = 90_000; // 90 segundos (entre 60 e 120 segundos)

function readDismissedFlag(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function usePWAInstall(currentPathname: string) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() =>
    typeof window !== 'undefined' ? readDismissedFlag() : false
  );
  const [delayElapsed, setDelayElapsed] = useState<boolean>(false);
  const [isTypingInForm, setIsTypingInForm] = useState<boolean>(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleFocusChange = () => {
      const active = document.activeElement;
      if (!active) {
        setIsTypingInForm(false);
        return;
      }
      const tag = active.tagName.toLowerCase();
      setIsTypingInForm(tag === 'input' || tag === 'textarea' || tag === 'select');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('focusout', handleFocusChange);

    const timer = window.setTimeout(() => {
      setDelayElapsed(true);
    }, INSTALL_PROMPT_DELAY_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('focusin', handleFocusChange);
      document.removeEventListener('focusout', handleFocusChange);
      window.clearTimeout(timer);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // Continua em memória durante a sessão caso o armazenamento não esteja disponível
    }
  }, []);

  const triggerNativeInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) {
      return 'unavailable';
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return 'accepted';
    }
    dismissPrompt();
    return 'dismissed';
  }, [deferredPrompt, dismissPrompt]);

  const isCheckoutRoute = currentPathname.startsWith('/finalizar');
  const canOfferInvite = Boolean(deferredPrompt) || isIOS;

  const shouldShowTimedInvite =
    delayElapsed &&
    canOfferInvite &&
    !isInstalled &&
    !isDismissed &&
    !isCheckoutRoute &&
    !isTypingInForm;

  return {
    isInstalled,
    isInstallableNatively: Boolean(deferredPrompt),
    isIOS,
    shouldShowTimedInvite,
    triggerNativeInstall,
    dismissPrompt,
  };
}
