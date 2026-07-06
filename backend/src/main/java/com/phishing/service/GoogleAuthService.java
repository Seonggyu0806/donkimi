package com.phishing.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * 구글 ID 토큰 검증 서비스.
 * 앱(Google Sign-In)에서 받은 id_token을 구글의 tokeninfo 엔드포인트로 검증해
 * 이메일·이름·고유ID(sub)를 꺼내온다. (구글 공개키로 직접 서명 검증하는 대신
 * 구글 서버에 위임 — 다른 외부 API 서비스들과 동일한 스타일)
 */
@Service
public class GoogleAuthService {

    // Google Cloud Console에서 발급받은 "웹 애플리케이션" 클라이언트 ID.
    // id_token의 aud(수신자) 클레임이 이 값과 일치하는지 검증해 위조 토큰을 막는다.
    @Value("${google.oauth.web-client-id:}")
    private String webClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    public record GoogleUserInfo(String email, String name, String providerId) {}

    public GoogleUserInfo verifyIdToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("구글 로그인 토큰이 없습니다");
        }

        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        Map<?, ?> response;
        try {
            response = restTemplate.getForObject(url, Map.class);
        } catch (RestClientException e) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 구글 토큰입니다");
        }

        if (response == null) {
            throw new IllegalArgumentException("구글 토큰을 확인할 수 없습니다");
        }

        String aud = (String) response.get("aud");
        if (webClientId != null && !webClientId.isBlank() && !webClientId.equals(aud)) {
            throw new IllegalArgumentException("이 앱에서 발급되지 않은 구글 토큰입니다");
        }

        String email = (String) response.get("email");
        String sub = (String) response.get("sub");
        String name = (String) response.get("name");

        if (email == null || sub == null) {
            throw new IllegalArgumentException("구글 계정 정보를 확인할 수 없습니다");
        }

        return new GoogleUserInfo(email, (name != null && !name.isBlank()) ? name : email.split("@")[0], sub);
    }
}
