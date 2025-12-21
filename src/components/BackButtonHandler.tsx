"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTelegram } from "./TelegramProvider";

/**
 * Компонент для управления кнопкой "Назад" в Telegram Mini App
 * Показывает кнопку на всех страницах кроме главной "/"
 */
export default function BackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const { webApp, isReady } = useTelegram();

  useEffect(() => {
    if (!isReady || !webApp?.BackButton) {
      return;
    }

    const backButton = webApp.BackButton;

    // Показываем кнопку назад на всех страницах кроме главной
    if (pathname !== "/") {
      backButton.show();

      // Обработчик нажатия - возврат назад
      const handleClick = () => {
        router.back();
      };

      backButton.onClick(handleClick);

      // Cleanup при размонтировании
      return () => {
        backButton.offClick(handleClick);
        backButton.hide();
      };
    } else {
      // На главной странице скрываем кнопку
      backButton.hide();
    }
  }, [pathname, router, webApp, isReady]);

  return null;
}
