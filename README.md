# 🛡️ 돈킴이 (DonKimi)

> **AI 기반 피싱 탐지 플랫폼** — 악성 링크·피싱 사이트·보이스피싱을 실시간으로 분석하고 위험도를 알려줍니다.

원래 4인 팀(team5) 프로젝트로 시작했고, 현재 **혼자서 서버 배포 · DB 운영 · 모바일 앱 전환**까지 발전시키는 솔로 개발 버전입니다.

🌐 **라이브 웹앱:** https://donkimi.vercel.app
🔌 **라이브 API (Swagger):** https://donkimi.up.railway.app/swagger-ui/index.html

> 프론트(Vercel) → `/api` 프록시 → 백엔드(Railway) → MySQL 까지 전체 배포 완료.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔗 URL 분석 | 의심스러운 링크의 피싱 위험도 판별 |
| 🎙️ 음성 분석 (STT) | 통화 녹음을 텍스트로 변환 후 보이스피싱 패턴 분석 |
| 🖼️ 이미지 분석 (OCR) | 캡처/문자 이미지에서 텍스트 추출 후 위험 분석 |
| 📞 전화번호 조회 | 신고된 피싱 번호 데이터베이스 조회 |
| 💬 AI 챗봇 상담 | 피싱 의심 상황을 대화로 진단 |
| 📊 대시보드 | 위험 통계 및 신고 랭킹 |

위험도는 `riskScore`(0~100)로 산출되어 **안전 / 낮음 / 중간 / 주의 / 위험** 5단계로 표시됩니다.

---

## 🧱 기술 스택

**프론트엔드**
- React 19 · TypeScript · Vite
- TailwindCSS · React Router · TanStack Query · axios · zod

**백엔드**
- Java 17 · Spring Boot 4.0 · Spring Data JPA
- Spring Security · JWT · springdoc(OpenAPI/Swagger)

**데이터베이스 / 인프라**
- MySQL 8.0
- (예정) Railway 배포

---

## 📂 프로젝트 구조

```
donkimi/
├── backend/     # Spring Boot API 서버 (com.phishing)
│   └── src/main/java/com/phishing/
│       ├── controller/   # REST API 엔드포인트
│       ├── service/      # 비즈니스 로직 (분석/STT/OCR 등)
│       ├── domain/       # JPA 엔티티 (User, PhoneReport ...)
│       ├── repository/   # 데이터 접근
│       ├── dto/          # 요청/응답 모델
│       └── config/       # Security, JWT, Swagger
└── frontend/    # React 웹 클라이언트
    └── src/
        ├── pages/        # 화면 (진단/챗봇/마이페이지/관리자)
        ├── api/          # 백엔드 연동 (+ mock)
        └── components/   # 공용 UI
```

---

## 🚀 로컬 실행 방법

### 사전 준비
- JDK 17
- MySQL 8.0 (실행 중)
- Node.js 20+

### 1) 데이터베이스 생성
```sql
CREATE DATABASE donkimi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2) 백엔드 설정 & 실행
```bash
cd backend
# 설정 템플릿 복사 후 본인 값(MySQL 비번 등) 입력
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml

./gradlew bootRun
```
- 서버: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html

### 3) 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```
> 실제 백엔드와 연동하려면 `frontend/.env.development` 에서 `VITE_USE_MOCK=false` 로 설정.

---

## 🗺️ 개발 로드맵

- [x] **M0** 개발 환경 + 독립 레포 구성
- [x] **M1** 백엔드 로컬 구동 + MySQL 연동 (API 25개 동작)
- [x] **M2** 프론트엔드 ↔ 백엔드 로컬 통합 (회원가입/로그인 실동작)
- [x] **M3** Railway 클라우드 배포 (서버 + DB 라이브) → https://donkimi.up.railway.app
- [x] **M4** 외부 분석 API 연동 — URL(Safe Browsing) · 이미지(Vision OCR) · 음성(Naver STT) · AI(OpenAI)
- [ ] **M5** React Native 모바일 앱 전환
- [ ] **M6** 앱 고유 기능(푸시 알림 등) + 마무리

📝 작업 과정 기록은 [위키](https://github.com/Seonggyu0806/donkimi/wiki)에서 확인하세요.

---

## 👤 개발자
- **박성규** ([@Seonggyu0806](https://github.com/Seonggyu0806)) — 솔로 발전 (서버/DB/앱)
- 원팀(team5): 박성규, 송용욱, 최유진, 한태경
