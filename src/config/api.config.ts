export const API_CONFIG = {
  BASE_URL:
    process.env["NEXT_PUBLIC_API_URL"] || "https://api.chess-id.goodhumored.ru",
  SECRET: process.env["NEXT_PUBLIC_API_SECRET"] || "",
} as const;
