package com.phishing.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 구글 ID 토큰 클레임 검사 단위 테스트.
 * 구글 로그인은 같은 이메일의 기존 계정으로 로그인시키므로,
 * 이메일 인증이 안 된 구글 계정이나 다른 앱의 토큰은 반드시 거절돼야 한다.
 */
class GoogleAuthServiceTest {

    private static final String WEB_CLIENT_ID = "test-web-client.apps.googleusercontent.com";

    private Map<String, Object> claims(Object emailVerified) {
        Map<String, Object> m = new HashMap<>();
        m.put("aud", WEB_CLIENT_ID);
        m.put("email", "user@example.com");
        m.put("sub", "1234567890");
        m.put("name", "테스트");
        if (emailVerified != null) m.put("email_verified", emailVerified);
        return m;
    }

    @Test
    @DisplayName("이메일 인증된 계정(email_verified 문자열 \"true\")은 통과한다")
    void verifiedString_passes() {
        GoogleAuthService.GoogleUserInfo info = GoogleAuthService.toUserInfo(claims("true"), WEB_CLIENT_ID);

        assertThat(info.email()).isEqualTo("user@example.com");
        assertThat(info.providerId()).isEqualTo("1234567890");
    }

    @Test
    @DisplayName("이메일 인증된 계정(email_verified 불리언 true)도 통과한다")
    void verifiedBoolean_passes() {
        assertThat(GoogleAuthService.toUserInfo(claims(true), WEB_CLIENT_ID).email()).isEqualTo("user@example.com");
    }

    @Test
    @DisplayName("이메일 인증이 안 된 구글 계정은 거절한다 (기존 계정 탈취 방지)")
    void unverified_isRejected() {
        assertThatThrownBy(() -> GoogleAuthService.toUserInfo(claims("false"), WEB_CLIENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이메일 인증");
    }

    @Test
    @DisplayName("email_verified 값이 없으면 거절한다")
    void missingVerified_isRejected() {
        assertThatThrownBy(() -> GoogleAuthService.toUserInfo(claims(null), WEB_CLIENT_ID))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("다른 앱용으로 발급된 토큰(aud 불일치)은 거절한다")
    void otherAudience_isRejected() {
        Map<String, Object> m = claims("true");
        m.put("aud", "someone-else.apps.googleusercontent.com");

        assertThatThrownBy(() -> GoogleAuthService.toUserInfo(m, WEB_CLIENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("발급되지 않은");
    }
}
