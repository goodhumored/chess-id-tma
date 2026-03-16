export const DEV_CONFIG = {
    /** 
     * При установленном значение "true" будем мокироваться окружение телеграма значениями из MOCKED_USER
     */
    SKIP_TELEGRAM_AUTH: process.env["NEXT_PUBLIC_SKIP_TELEGRAM_AUTH"]?.toLowerCase() == "true",

    /**
     * Токен тестового бота, необходимый для верификации замокированного пользователя на бекенде
     * Должен совпадать с соответствующим значением из .env бека 
     */
    BOT_TOKEN: process.env["NEXT_PUBLIC_TELEGRAM_BOT_TOKEN"] || ""
} as const;
