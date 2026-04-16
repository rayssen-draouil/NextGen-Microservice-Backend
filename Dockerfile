FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka

COPY target/ConfigSever-0.0.1-SNAPSHOT.jar configserver.jar
EXPOSE 8585

ENTRYPOINT ["java", "-jar", "configserver.jar"]