FROM node:18-alpine AS base

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm@8

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/workshop-web/package.json ./apps/workshop-web/
COPY apps/fleet-manager-web/package.json ./apps/fleet-manager-web/
COPY apps/parts-web/package.json ./apps/parts-web/
COPY apps/superadmin-web/package.json ./apps/superadmin-web/
COPY packages/*/package.json ./packages/*/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 빌드 단계
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm@8

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/*/node_modules ./apps/*/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules
COPY . .

# 환경변수 설정
ENV NEXT_TELEMETRY_DISABLED 1

# 빌드
RUN pnpm run build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder /app/apps/workshop-web/public ./apps/workshop-web/public
COPY --from=builder /app/apps/workshop-web/.next/standalone ./
COPY --from=builder /app/apps/workshop-web/.next/static ./apps/workshop-web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "apps/workshop-web/server.js"]
