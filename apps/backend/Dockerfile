FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace=apps/backend

COPY apps/backend ./apps/backend
RUN cd apps/backend && npx prisma generate
RUN cd apps/backend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY apps/backend/prisma ./prisma

RUN apk add --no-cache openssl

EXPOSE 3001

CMD npx prisma migrate deploy && node dist/main
