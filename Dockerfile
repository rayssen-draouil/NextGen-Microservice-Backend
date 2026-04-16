FROM mysql:8.0

ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes \
	MYSQL_ROOT_HOST=%

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306