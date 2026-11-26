package com.phishing.service;

import com.phishing.repository.DailyApiUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 유료 외부 API(예: Google Vision)의 하루 호출 상한을 지키는 장치.
 * 콘솔 할당량에 "하루 단위" 항목이 없어서 월 사용량(=과금)을 서버에서 직접 막는다.
 */
@Service
@RequiredArgsConstructor
public class ApiUsageLimiter {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");   // 한국 날짜 기준으로 하루를 나눔

    private final DailyApiUsageRepository dailyApiUsageRepository;

    /**
     * 호출 1회를 기록하고, 오늘 횟수가 상한을 넘으면 예외를 던진다.
     * 상한을 넘으면 예외로 트랜잭션이 롤백돼 횟수는 상한에서 멈춘다 (외부 API도 부르지 않음).
     */
    @Transactional
    public void acquire(String apiName, int dailyLimit) {
        String usageKey = apiName + ":" + LocalDate.now(SEOUL);
        dailyApiUsageRepository.increment(usageKey);
        int usedCount = dailyApiUsageRepository.findUsedCount(usageKey);
        if (usedCount > dailyLimit) {
            throw new DailyLimitExceededException(apiName, dailyLimit);
        }
    }

    /** 오늘 상한을 다 쓴 경우 */
    public static class DailyLimitExceededException extends RuntimeException {
        public DailyLimitExceededException(String apiName, int dailyLimit) {
            super(apiName + " 하루 사용 한도(" + dailyLimit + "회)를 초과했습니다.");
        }
    }
}
