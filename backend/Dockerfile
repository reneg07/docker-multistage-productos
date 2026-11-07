# syntax=docker/dockerfile:1

# ==============================================================================
# ETAPA 1: COMPOSER BUILDER (Construcción de dependencias de producción)
# ==============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

# 1. Copiar manifiestos primero para maximizar el uso de caché de capas
COPY composer.json composer.lock ./

# 2. Descargar e instalar exclusivamente dependencias de producción
RUN --mount=type=cache,target=/tmp/cache \
    composer install \
        --no-dev \
        --no-interaction \
        --prefer-dist \
        --no-scripts \
        --no-autoloader

# 3. Copiar código fuente indispensable para mapear el autoloader
COPY . .

# 4. Generar autoloader optimizado para producción
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# ==============================================================================
# ETAPA 2: IMAGEN FINAL DE PRODUCCIÓN (Runtime mínimo Alpine)
# ==============================================================================
FROM php:8.2-fpm-alpine AS production

LABEL maintainer="Equipo DevOps" \
      description="API REST Laravel 12 en PHP 8.2 con Nginx y Supervisor optimizado"

WORKDIR /var/www/html

# Variables de entorno de producción
ENV APP_ENV=production \
    APP_DEBUG=false

# 1. Instalación de Nginx, Supervisor, dependencias de runtime y extensiones PHP
# Se utiliza un paquete virtual .build-deps que se elimina en la misma capa para reducir peso
RUN apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev && \
    apk add --no-cache \
        nginx \
        supervisor \
        curl \
        libpng \
        libjpeg-turbo \
        freetype \
        libzip \
        oniguruma && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        gd \
        zip \
        opcache \
        bcmath && \
    apk del .build-deps && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# 2. Copiar configuraciones de Nginx, PHP-FPM, Supervisor y Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 3. Copiar dependencias de producción exclusivamente desde el builder
COPY --from=composer-builder /app/vendor /var/www/html/vendor

# 4. Copiar código fuente limpio de la aplicación (.dockerignore filtra tests, logs, .git)
COPY . /var/www/html

# 5. Ajustar permisos específicos de almacenamiento, caché y pre-descubrimiento de paquetes de producción
RUN mkdir -p /var/www/html/storage/app/public/products \
             /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache && \
    php artisan package:discover --ansi && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Puerto HTTP expuesto por Nginx
EXPOSE 8000

# Healthcheck nativo consultando el endpoint /api/health
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
