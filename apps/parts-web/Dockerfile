FROM node:18-alpine AS base

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 패키지 매니저 설치
RUN npm install -g pnpm

# package.json과 pnpm-lock.yaml 복사
COPY package.json pnpm-lock.yaml* ./
COPY apps/parts-web/package.json ./apps/parts-web/
COPY packages/*/package.json ./packages/*/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 빌드 단계
FROM base AS builder
WORKDIR /app
RUN npm install -g pnpm

# 모든 파일 복사
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/parts-web/node_modules ./apps/parts-web/node_modules

# Next.js 빌드
ENV NEXT_TELEMETRY_DISABLED 1
RUN cd apps/parts-web && pnpm build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 실행에 필요한 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 파일 복사
COPY --from=builder /app/apps/parts-web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/parts-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/parts-web/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT 3002

CMD ["node", "apps/parts-web/server.js"]
