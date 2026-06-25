# ============================================================
#  돈킴이 백엔드 배포용 Dockerfile (Railway 등)
# ============================================================

# --- 1단계: 빌드 ---
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# 로컬 전용 JDK 경로(Windows) 설정 제거 — 컨테이너에선 컨테이너의 JDK 17 사용
RUN sed -i '/org.gradle.java.home/d' gradle.properties || true
# 실행 가능한 부트 JAR 생성 (테스트는 빌드에서 제외)
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# --- 2단계: 실행 ---
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Railway가 주입하는 PORT 환경변수를 Spring이 사용 (application.yaml: ${PORT:8080})
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
