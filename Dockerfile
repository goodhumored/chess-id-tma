FROM node:18-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

#          ╭───────────────────────────────────────────────────────────╮
#          │                           build                           │
#          ╰───────────────────────────────────────────────────────────╯
FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

#          ╭───────────────────────────────────────────────────────────╮
#          │                        prod build                         │
#          ╰───────────────────────────────────────────────────────────╯
FROM base AS prod

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --chown=nextjs:nodejs next* ./

# RUN apk add curl
# RUN apk add ca-certificates
# RUN update-ca-certificates

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD [ "pnpm", "start" ]
