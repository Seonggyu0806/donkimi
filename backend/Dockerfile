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
# 호스트(Render 등)가 주입하는 PORT 환경변수를 Spring이 사용 (application.yaml: ${PORT:8080})
#
# 무료 티어(Render 512MB)에 맞춘 보수적 JVM 메모리 설정:
#  - MaxRAMPercentage=60  : 컨테이너 메모리(512MB)의 60%(~307MB)만 힙으로 사용.
#                           메타스페이스·스레드 스택·네이티브 오버헤드까지 512MB 안에 들어오게 함
#  - UseSerialGC          : 1 vCPU·소형 힙에 적합. G1 대비 백그라운드 GC 스레드가 없어 오버헤드 작음
#  - MaxMetaspaceSize=128m: 메타스페이스 상한
# ⚠️ 512MB는 이 앱에 빠듯할 수 있음. 기동 중 OOM이 나면 percentage를 더 낮추거나
#    application-prod.yml에 spring.main.lazy-initialization=true 를 추가할 것.
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:MaxRAMPercentage=60.0", "-XX:MaxMetaspaceSize=128m", "-jar", "/app/app.jar"]
