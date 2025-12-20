'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramContextType {
  webApp: typeof window.Telegram.WebApp | null;
  user: typeof window.Telegram.WebApp.initDataUnsafe.user | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [webApp, setWebApp] = useState<typeof window.Telegram.WebApp | null>(null);
  const [user, setUser] = useState<typeof window.Telegram.WebApp.initDataUnsafe.user | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;

        tg.ready();
        tg.expand();

        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
        setIsReady(true);

        // Apply Telegram theme
        if (tg.themeParams) {
          document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
          document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
          document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
          document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
          document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
          document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        }
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTelegram);
    } else {
      initTelegram();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initTelegram);
    };
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const tg = (window as any)?.Telegram?.WebApp;
    if (!tg) return;

    const applyStableHeight = () => {
      document.documentElement.style.setProperty(
        "--tg-full-height",
        tg.stableHeight ?? window.innerHeight + "px"
      );
    };

    tg.onEvent("viewportChanged", applyStableHeight);
    applyStableHeight(); // initial

    return () => {
      tg.offEvent("viewportChanged", applyStableHeight);
    };
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};
