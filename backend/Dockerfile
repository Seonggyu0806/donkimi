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
# FFmpeg 설치 (음성(STT) 분석 시 오디오를 50초 단위로 분할하는 데 필요)
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
# Railway가 주입하는 PORT 환경변수를 Spring이 사용 (application.yaml: ${PORT:8080})
#
# 컨테이너 메모리 비용 절감 설정:
#  - MaxRAMPercentage=75  : 컨테이너에 걸린 메모리 제한을 JVM이 인식해 그 75%만 힙으로 사용
#                           (기본값은 호스트 전체를 보거나 지나치게 보수적이라 실사용/청구가 커짐)
#  - UseSerialGC          : 1 vCPU·소형 힙 환경에 적합. G1 대비 백그라운드 GC 스레드가 없어
#                           상시 메모리 오버헤드가 작음
#  - MaxMetaspaceSize=192m: 메타스페이스 상한을 둬서 예기치 않게 증가하는 것을 방지
# ⚠️ Railway 대시보드에서 서비스 메모리 제한(512MB 권장)을 설정해야 위 percentage가 의미를 가짐.
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:MaxRAMPercentage=75.0", "-XX:MaxMetaspaceSize=192m", "-jar", "/app/app.jar"]
