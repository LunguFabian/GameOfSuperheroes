FROM php:8.2-apache

# Activeaza extensiile necesare pentru MySQL
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Activeaza mod_rewrite (optional pentru routing elegant)
RUN a2enmod rewrite

RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf
# Seteaza directorul de lucru
WORKDIR /var/www/html

# Permisiuni mai permisive pentru testare
RUN chown -R www-data:www-data /var/www/html
