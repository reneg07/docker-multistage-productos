#!/bin/sh
set -e

echo "[Entrypoint] Inicializando contenedor backend Laravel..."

# 1. Verificacion de variables esenciales
if [ -z "$APP_KEY" ]; then
    echo "[Entrypoint] ADVERTENCIA: APP_KEY no esta configurada. La aplicacion podria no responder correctamente."
fi

# 2. Creacion controlada y verificacion de permisos de almacenamiento
mkdir -p /var/www/html/storage/app/public/products \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Ajustar permisos solo en directorios que requieren escritura
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 3. Enlace simbolico publico para storage (idempotente)
if [ ! -L /var/www/html/public/storage ]; then
    echo "[Entrypoint] Creando enlace simbolico public/storage..."
    php artisan storage:link --force || true
fi

# 4. Espera controlada a la base de datos (con limite maximo de 30 segundos)
if [ "$DB_CONNECTION" = "mysql" ] && [ -n "$DB_HOST" ]; then
    echo "[Entrypoint] Verificando conexion a MySQL en $DB_HOST:${DB_PORT:-3306}..."
    max_retries=30
    count=0
    until php -r "
        \$host = getenv('DB_HOST');
        \$port = getenv('DB_PORT') ?: 3306;
        \$db   = getenv('DB_DATABASE');
        \$user = getenv('DB_USERNAME');
        \$pass = getenv('DB_PASSWORD');
        try {
            new PDO(\"mysql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass, [
                PDO::ATTR_TIMEOUT => 2,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            exit(0);
        } catch (\Throwable \$e) {
            exit(1);
        }
    " 2>/dev/null; do
        count=$((count + 1))
        if [ $count -ge $max_retries ]; then
            echo "[Entrypoint] AVISO: Se alcanzo el limite de tiempo (30s) esperando a MySQL. Continuando arranque..."
            break
        fi
        echo "[Entrypoint] Esperando a MySQL ($count/$max_retries)..."
        sleep 1
    done

    # 5. Ejecucion de migraciones de forma idempotente
    if [ $count -lt $max_retries ]; then
        echo "[Entrypoint] MySQL disponible. Ejecutando migraciones..."
        php artisan migrate --force || echo "[Entrypoint] Error o advertencia al ejecutar migraciones."
    fi
fi

# 6. Optimizaciones de cache en produccion
if [ "$APP_ENV" = "production" ] && [ -n "$APP_KEY" ]; then
    echo "[Entrypoint] Optimizando cache de configuracion y rutas..."
    php artisan config:cache || true
    php artisan route:cache || true
fi

echo "[Entrypoint] Inicializacion completada exitosamente. Arrancando procesos..."
exec "$@"
