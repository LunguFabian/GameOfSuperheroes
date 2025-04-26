FROM php:8.2-apache

# Activează extensiile necesare pentru MySQL
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Activează mod_rewrite (opțional pentru routing elegant)
RUN a2enmod rewrite

RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf
# Setează directorul de lucru
WORKDIR /var/www/html

# Permisiuni mai permisive pentru testare
RUN chown -R www-data:www-data /var/www/html
