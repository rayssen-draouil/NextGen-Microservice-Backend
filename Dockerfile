FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace

COPY pom.xml .
COPY src src

RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

ENV SERVER_PORT=3000 \
	SPRING_CLOUD_CONFIG_URI=http://host.docker.internal:8585 \
	EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka \
	SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://host.docker.internal:8080/realms/BoardKeycloak

COPY --from=build /workspace/target/APIGatewayMain-0.0.1-SNAPSHOT.jar apigateway.jar

EXPOSE 3000

ENTRYPOINT ["java", "-jar", "/app/apigateway.jar"]

