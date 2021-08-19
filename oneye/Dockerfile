FROM php:5-apache
WORKDIR /var/www/html/
COPY . /var/www/html/

RUN chmod -R 777 /var/www/html

#RUN echo "ServerName 192.168.0.102" >> /etc/apache2/apache2.conf

#RUN docker-php-ext-install pdo pdo_mysql
#RUN docker-php-ext-install mysqli

EXPOSE 80
