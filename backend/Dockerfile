# --- Build stage ---
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Runtime stage ---
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S mmm && adduser -S mmm -G mmm
COPY --from=build /app/target/makros-backend.jar app.jar
USER mmm
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
