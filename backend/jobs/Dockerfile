FROM node:18-alpine AS base

# 기본 작업 디렉터리 설정
WORKDIR /app

# 패키지 매니저로 pnpm 설치
RUN npm install -g pnpm

# 종속성 설치를 위한 단계
FROM base AS deps
COPY package.json ./
# pnpm-lock.yaml 파일이 있을 경우에만 복사
COPY pnpm-lock.yaml* ./
# 락파일이 있으면 --frozen-lockfile, 없으면 일반 설치
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# 빌드 단계
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 실행 단계
FROM base AS runner
ENV NODE_ENV production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["node", "dist/index.js"]