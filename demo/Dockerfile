# --- Build Stage ---
FROM maven:3.9.7-eclipse-temurin-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven configuration and source code
COPY pom.xml .
COPY src ./src

# Build the application, skipping tests for a faster build
RUN mvn clean package -DskipTests

# --- Run Stage ---
FROM eclipse-temurin:17-jre-jammy

# Set the working directory in the new image
WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app listens on
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]