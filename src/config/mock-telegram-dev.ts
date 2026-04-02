import { DEV_CONFIG } from "@/config/dev.config";

type TgUser = {
    id: number
    first_name: string
    last_name?: string
    username?: string
}

/**
 * Замокированный пользователь телеграма
 */
const MOCKED_USER: TgUser = {
    id: 99999,
    first_name: "ИМЯ",
    last_name: "ФАМИЛИЯ",
    username: "test_user_123"
}

async function generateInitData(user: TgUser): Promise<string> {
    const botToken = DEV_CONFIG.BOT_TOKEN
    if (!botToken) throw new Error("Missing NEXT_PUBLIC_TELEGRAM_BOT_TOKEN")

    const authDate = Math.floor(Date.now() / 1000)

    const payload: Record<string, string> = {
        auth_date: String(authDate),
        query_id: "AAFakeQueryId123",
        user: JSON.stringify(user),
    }

    const dataCheckString = Object.entries(payload)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("\n")

    // secret_key = HMAC_SHA256("WebAppData", bot_token)
    const secretKey = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode("WebAppData"),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        ),
        new TextEncoder().encode(botToken)
    )

    const secretKeyBytes = new Uint8Array(secretKey)

    // hash = HMAC_SHA256(data_check_string, secret_key)
    const hashBuffer = await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
            "raw",
            secretKeyBytes,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        ),
        new TextEncoder().encode(dataCheckString)
    )

    const hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    payload["hash"] = hash

    return new URLSearchParams(payload).toString()
}

export async function mockTelegram() {
    if (!DEV_CONFIG.SKIP_TELEGRAM_AUTH) return
    if (typeof window === "undefined") return

    const initData = await generateInitData(MOCKED_USER)

    ;(window as any).Telegram = {
        WebApp: {
            initData,
            initDataUnsafe: {
                user: MOCKED_USER,
                query_id: "AAFakeQueryId123",
                auth_date: Math.floor(Date.now() / 1000),
            },

            ready() {},
            expand() {},
            close() {},

            MainButton: {
                show() {},
                hide() {},
                setText() {},
                onClick() {},
            },
        },
    }

    console.log("Telegram mocked", initData)
}