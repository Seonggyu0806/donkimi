# 🛡️ 돈킴이 (DonKimi)

> **AI 기반 피싱 탐지 플랫폼** — 악성 링크·피싱 사이트·보이스피싱을 실시간으로 분석하고 위험도를 알려줍니다.

원래 4인 팀(team5) 프로젝트로 시작했고, 현재 **혼자서 서버 배포 · DB 운영 · 모바일 앱 전환**까지 발전시키는 솔로 개발 버전입니다.

🌐 **라이브 웹앱:** https://donkimi.vercel.app
🔌 **라이브 API (Swagger):** https://donkimi-backend.onrender.com/swagger-ui/index.html

> 프론트(Vercel) → `/api` 프록시 → 백엔드(Render) → TiDB Serverless(MySQL 호환) 까지 전체 배포 완료.
> 전액 무료 스택으로 운영합니다. (백엔드는 무료 티어 특성상 유휴 후 첫 요청에 콜드스타트가 있을 수 있습니다.)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔗 URL 분석 | 의심스러운 링크의 피싱 위험도 판별 |
| 🎙️ 음성 분석 (STT) | 통화 녹음을 텍스트로 변환 후 보이스피싱 패턴 분석 |
| 🖼️ 이미지 분석 (OCR) | 캡처/문자 이미지에서 텍스트 추출 후 위험 분석 |
| 📞 전화번호 조회 | 신고된 피싱 번호 데이터베이스 조회 · 신고하기 |
| 💬 AI 챗봇 상담 | 피싱 의심 상황을 대화로 진단 (답변 마크다운 렌더링) |
| 📊 대시보드 | 위험 통계 및 신고 랭킹 |
| 🚫 통화 차단 (앱) | 안드로이드 네이티브 통화 스크리닝으로 지정 번호 자동 거절 (기기 로컬 + 계정 백업 동기화) |
| 🔐 인증 | 이메일/비밀번호(JWT) · Google 소셜 로그인 · 회원 탈퇴 |

위험도는 `riskScore`(0~100)로 산출되어 **안전 / 낮음 / 중간 / 주의 / 위험** 5단계로 표시됩니다.

---

## 🧱 기술 스택

**프론트엔드 (웹)**
- React 19 · TypeScript · Vite
- TailwindCSS · React Router · TanStack Query · axios · zod

**모바일 앱**
- React Native (Expo, SDK 54) · expo-router
- 안드로이드 네이티브 모듈(Kotlin): 통화 스크리닝(CallScreeningService)
- `@react-native-google-signin` (구글 로그인)

**백엔드**
- Java 17 · Spring Boot 4.0 · Spring Data JPA
- Spring Security · JWT · springdoc(OpenAPI/Swagger)
- 외부 API: Google Safe Browsing · Google Vision(OCR) · OpenAI · Naver CLOVA STT

**데이터베이스 / 인프라**
- TiDB Serverless (MySQL 호환, 무료) · 로컬 개발은 MySQL 8.0
- Render(백엔드, Docker) · Vercel(웹, `/api` 프록시) — 전액 무료 스택

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
├── frontend/    # React 웹 클라이언트
│   └── src/
│       ├── pages/        # 화면 (진단/챗봇/마이페이지/관리자)
│       ├── api/          # 백엔드 연동 (+ mock)
│       └── components/   # 공용 UI
└── app/         # React Native 모바일 앱 (Expo)
    ├── src/
    │   ├── app/          # expo-router 화면 (진단/챗봇/차단목록/탈퇴 ...)
    │   ├── api/          # 백엔드 연동
    │   ├── native/       # 네이티브 모듈 래퍼 (통화 차단, 구글 로그인)
    │   └── ui/           # 공용 UI (알림창, RichText ...)
    └── android/          # 네이티브 안드로이드 프로젝트 (Kotlin 통화 스크리닝)
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
- [x] **M3** 클라우드 배포 (서버 + DB 라이브)
- [x] **M4** 외부 분석 API 연동 — URL(Safe Browsing) · 이미지(Vision OCR) · 음성(Naver STT) · AI(OpenAI)
- [x] **M5** React Native 모바일 앱 전환 (핵심 기능 + 다듬기)
- [x] **Phase B** 안드로이드 네이티브 통화 차단 (실기기 실통화 검증 완료)
- [x] **완성도** 구글 로그인 · 차단 번호 계정 동기화 · 회원 탈퇴 · 챗봇 마크다운 렌더링
- [x] **홈 개편** 배너 캐러셀(자동 전환) · 위험도 계기판 · 전체/개인 통계
- [x] **인프라 이전** Railway → Render + TiDB Serverless (전액 무료 스택)
- [ ] **추가 검토** (선택) 카카오 로그인

📌 세부 작업 기록은 [위키 개발일지](https://github.com/Seonggyu0806/donkimi/wiki)에서 날짜별로 확인할 수 있습니다.

---

## 👤 개발자
- **박성규** ([@Seonggyu0806](https://github.com/Seonggyu0806)) — 솔로 발전 (서버/DB/앱)
- 원팀(team5): 박성규, 송용욱, 최유진, 한태경
