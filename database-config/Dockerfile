FROM nginx:latest

RUN rm /etc/nginx/conf.d/*

COPY default.conf /etc/nginx/conf.d

RUN mkdir -p /var/www/veggie-club/food