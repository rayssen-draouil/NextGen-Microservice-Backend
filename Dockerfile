FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace

COPY pom.xml .
COPY src src

RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV SERVER_PORT=8084 \
	SPRING_DATASOURCE_URL=jdbc:h2:mem:livraisondb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE \
	SPRING_DATASOURCE_USERNAME=sa \
	SPRING_DATASOURCE_PASSWORD= \
	SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver \
	SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect \
	SPRING_JPA_HIBERNATE_DDL_AUTO=update \
	SPRING_H2_CONSOLE_ENABLED=true \
	SPRING_H2_CONSOLE_PATH=/h2 \
	SPRING_CLOUD_CONFIG_URI=http://host.docker.internal:8585 \
	EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka \
	SPRING_RABBITMQ_HOST=host.docker.internal \
	SPRING_RABBITMQ_PORT=5672 \
	SPRING_RABBITMQ_USERNAME=guest \
	SPRING_RABBITMQ_PASSWORD=guest

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "/app/app.jar"]