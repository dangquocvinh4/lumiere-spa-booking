# Stage 1: Build the application
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src ./src
# Fix line endings of mvnw for Linux container compatibility
RUN sed -i 's/\r$//' mvnw
# Grant execute permission to mvnw
RUN chmod +x mvnw
# Build the application using maven wrapper skipping tests
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
