# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine as build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# List the built JAR files for debugging
RUN ls -la /app/target/
RUN find /app/target/ -name "*.jar"

# Production stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the JAR file with explicit name
COPY --from=build --chown=spring:spring /app/target/cce-demo-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
