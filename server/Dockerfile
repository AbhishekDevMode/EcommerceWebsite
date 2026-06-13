# --- Step 1: Build the Maven Application ---

FROM eclipse-temurin:26-jdk-jammy AS build
WORKDIR /app

# Install Maven manually in the container
RUN apt-get update && apt-get install -y maven

COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# --- Step 2: Run the Application ---
FROM eclipse-temurin:26-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Expose the default port Render uses
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]