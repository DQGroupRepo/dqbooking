FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /src

COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

COPY --from=build /src/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]