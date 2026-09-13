FROM openjdk:11-jre-slim
COPY --from=backend-builder /app/backend/target/booking-backend.jar /app/backend/booking-backend.jar
WORKDIR /app/backend
ENV SPRING_PROFILES_ACTIVE=prod
VOLUME /tmp
CMD ["java", "-jar", "booking-backend.jar"]