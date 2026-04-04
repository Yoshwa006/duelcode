# ============================================
# Stage 1: Build
# ============================================
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy maven wrapper and config
COPY mvnw mvnw.cmd ./
COPY .mvn/wrapper ./.mvn/wrapper

# Make wrapper executable
RUN chmod +x mvnw

# Copy POM first for dependency caching
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# ============================================
# Stage 2: Runtime
# ============================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# JVM options for production
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
