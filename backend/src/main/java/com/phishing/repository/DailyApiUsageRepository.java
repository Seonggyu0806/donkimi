package com.phishing.repository;

import com.phishing.domain.DailyApiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DailyApiUsageRepository extends JpaRepository<DailyApiUsage, String> {

    @Modifying
    @Query(value = "INSERT INTO daily_api_usage (usage_key, used_count) VALUES (:usageKey, 1) "
            + "ON DUPLICATE KEY UPDATE used_count = used_count + 1", nativeQuery = true)
    void increment(@Param("usageKey") String usageKey);
    // 오늘 첫 호출이면 1로 생성, 이미 있으면 +1
    // DB가 한 문장으로 처리하므로 동시에 요청이 와도 횟수가 꼬이지 않음 (MySQL·TiDB 문법)

    @Query("SELECT u.usedCount FROM DailyApiUsage u WHERE u.usageKey = :usageKey")
    int findUsedCount(@Param("usageKey") String usageKey);
    // 증가시킨 뒤의 현재 횟수 조회
}
