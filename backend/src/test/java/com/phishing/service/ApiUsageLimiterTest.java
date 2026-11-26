package com.phishing.service;

import com.phishing.repository.DailyApiUsageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 유료 API 하루 상한 단위 테스트.
 * 상한까지는 통과, 넘으면 예외 → 비용이 무한정 늘지 않는 것을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class ApiUsageLimiterTest {

    @Mock DailyApiUsageRepository dailyApiUsageRepository;
    @InjectMocks ApiUsageLimiter limiter;

    @Test
    @DisplayName("오늘 호출 횟수가 상한과 같으면 통과한다")
    void acquire_atLimit_passes() {
        when(dailyApiUsageRepository.findUsedCount(anyString())).thenReturn(30);

        assertThatCode(() -> limiter.acquire("VISION_OCR", 30)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("오늘 호출 횟수가 상한을 넘으면 예외가 난다")
    void acquire_overLimit_throws() {
        when(dailyApiUsageRepository.findUsedCount(anyString())).thenReturn(31);

        assertThatThrownBy(() -> limiter.acquire("VISION_OCR", 30))
                .isInstanceOf(ApiUsageLimiter.DailyLimitExceededException.class);
    }

    @Test
    @DisplayName("API 이름과 한국 날짜로 된 키로 횟수를 올린다")
    void acquire_usesApiNameAndSeoulDateKey() {
        when(dailyApiUsageRepository.findUsedCount(anyString())).thenReturn(1);

        limiter.acquire("VISION_OCR", 30);

        String expectedKey = "VISION_OCR:" + LocalDate.now(ZoneId.of("Asia/Seoul"));
        verify(dailyApiUsageRepository).increment(expectedKey);
        verify(dailyApiUsageRepository).findUsedCount(expectedKey);
    }
}
