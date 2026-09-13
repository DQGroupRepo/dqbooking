# Use a production-ready OpenJDK distribution
FROM eclipse-temurin:21-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy your compiled JAR file into the container
COPY target/my-application.jar app.jar

# Expose the application port
EXPOSE 8080

# Configure best-practice JVM flags for container environments
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"