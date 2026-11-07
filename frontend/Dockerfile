# syntax=docker/dockerfile:1

# ==============================================================================
# ETAPA 1: DEPENDENCIAS DE CONSTRUCCIÓN (deps)
# ==============================================================================
FROM node:20-alpine AS deps

# libc6-compat es requerida para compatibilidad con librerías nativas en Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia de manifiestos para aprovechar el caché de capas de Docker
COPY package.json package-lock.json ./

# Instalación estricta de todas las dependencias para la compilación
RUN npm ci

# ==============================================================================
# ETAPA 2: COMPILACIÓN DEL FRONTEND (builder)
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Reutilizar dependencias descargadas en la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno durante la compilación
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Ejecutar compilación optimizada y purgar la caché de compilación de Next.js
# (.next/cache es innecesario en runtime y reduce el peso de la imagen)
RUN npm run build && rm -rf .next/cache

# ==============================================================================
# ETAPA 3: RUNNER DE PRODUCCIÓN (runner)
# ==============================================================================
FROM node:20-alpine AS runner

LABEL maintainer="Equipo DevOps" \
      description="Frontend Next.js 16 App Router optimizado para producción"

WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Creación de usuario y grupo sin privilegios de root (principio de mínimo privilegio)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Instalar exclusivamente dependencias de producción en el runner
# Purgar caché de npm y binarios SWC incompatibles con Alpine (GNU glibc)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    rm -rf node_modules/@next/swc-linux-x64-gnu

# Copiar artefactos estáticos compilados y configuración
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/next.config.ts ./

# Conceder propiedad al usuario sin privilegios
USER nextjs

# Exponer el puerto de la aplicación
EXPOSE 3000

# Healthcheck HTTP nativo en el puerto 3000 (IPv4 loopback para compatibilidad Alpine)
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

# Ejecución de la aplicación mediante next start según especificación
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
