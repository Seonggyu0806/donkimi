package com.phishing.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PhoneReport의 신고 횟수 누적 → 위험 등급 산정 로직 단위 테스트.
 * 외부 의존성이 없는 순수 도메인 로직이라 목 없이 검증한다.
 */
class PhoneReportTest {

    private PhoneReport report() {
        // JPA prePersist는 실제 저장 시에만 실행되므로, new 직후 reportCount는 0(int 기본값)
        return new PhoneReport("01012345678");
    }

    private void reportNTimes(PhoneReport r, int n) {
        for (int i = 0; i < n; i++) r.increaseReportCount();
    }

    @Test
    @DisplayName("신고 1건이면 위험 등급은 LOW")
    void low() {
        PhoneReport r = report();
        reportNTimes(r, 1);
        assertThat(r.getReportCount()).isEqualTo(1);
        assertThat(r.getRiskLevel()).isEqualTo("LOW");
    }

    @Test
    @DisplayName("신고 3건이면 MEDIUM으로 상승")
    void mediumBoundary() {
        PhoneReport r = report();
        reportNTimes(r, 3);
        assertThat(r.getRiskLevel()).isEqualTo("MEDIUM");
    }

    @Test
    @DisplayName("신고 6건이면 HIGH로 상승")
    void highBoundary() {
        PhoneReport r = report();
        reportNTimes(r, 6);
        assertThat(r.getRiskLevel()).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("신고 10건이면 CRITICAL로 상승")
    void criticalBoundary() {
        PhoneReport r = report();
        reportNTimes(r, 10);
        assertThat(r.getReportCount()).isEqualTo(10);
        assertThat(r.getRiskLevel()).isEqualTo("CRITICAL");
    }

    @Test
    @DisplayName("경계 바로 아래(2건)는 아직 LOW, (5건)은 아직 MEDIUM")
    void justBelowBoundaries() {
        PhoneReport a = report();
        reportNTimes(a, 2);
        assertThat(a.getRiskLevel()).isEqualTo("LOW");

        PhoneReport b = report();
        reportNTimes(b, 5);
        assertThat(b.getRiskLevel()).isEqualTo("MEDIUM");
    }
}
