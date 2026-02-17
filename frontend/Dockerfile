# Stage 1: Install dependencies & Build
FROM node:20-slim AS builder
WORKDIR /app

# Salin package.json untuk install library
COPY package*.json ./
RUN npm install

# Salin semua file frontend
COPY . .

# Proses build (ini akan membaca file .env kamu)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Stage 2: Runner (Hanya ambil hasil jadi agar ringan)
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT 3000

# Next.js standalone butuh file-file hasil build ini
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Perintah untuk menyalakan server frontend
CMD ["node", "server.js"]