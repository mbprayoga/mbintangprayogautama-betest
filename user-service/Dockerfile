# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY auth-service/package.json ./auth-service/
COPY user-service/package.json ./user-service/

RUN pnpm install --frozen-lockfile

# Copy proto and user-service source
COPY proto/ ./proto/
COPY user-service/ ./user-service/

RUN cd user-service && pnpm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY auth-service/package.json ./auth-service/
COPY user-service/package.json ./user-service/

RUN pnpm install --frozen-lockfile --prod

COPY proto/ ./proto/
COPY --from=builder /app/user-service/dist ./user-service/dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "user-service/dist/server.js"]
