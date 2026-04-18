FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev

RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# 👇 COPIAR TODO PRIMERO
COPY . .

# Instalar dependencias después
RUN composer install --no-dev --no-interaction --ignore-platform-reqs

RUN chmod -R 775 storage bootstrap/cache

RUN useradd -U -u 1000 appuser && chown -R 1000:1000 /var/www
USER 1000

CMD php artisan serve --host=0.0.0.0 --port=$PORT