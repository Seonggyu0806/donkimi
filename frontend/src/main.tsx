// 앱 진입점 — #root DOM에 React 앱을 마운트
// StrictMode: 개발 환경에서 잠재적 문제를 감지 (이중 렌더링·사이드이펙트 경고)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

// 구글 로그인(GIS)용 웹 클라이언트 ID. 비어 있으면 로그인 화면에서 구글 버튼을 숨긴다.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
