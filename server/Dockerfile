# --- Step 1: Build the Maven Application ---
FROM maven:3.9.6-eclipse-temurin-26 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application and skip tests for faster deployment
RUN mvn clean package -DskipTests

# --- Step 2: Run the Application ---
FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

# Copy the compiled JAR from the build step
COPY --from=build /app/target/*.jar app.jar

# Expose the default port Render uses
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]