package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 유료 외부 API의 하루 호출 횟수 기록.
 * 서버가 재시작돼도(Render 무료 티어는 유휴 후 재기동) 횟수가 초기화되지 않도록 DB에 둔다.
 */
@Entity                              // 이 클래스가 DB 테이블과 연결됨
@Table(name = "daily_api_usage")     // 연결할 테이블 이름
@Getter                              // Lombok이 getter 자동 생성
@NoArgsConstructor                   // JPA용 빈 생성자 자동 생성
public class DailyApiUsage {

    @Id                                                        // 기본키 (PK)
    @Column(length = 64)
    private String usageKey;                                   // "API이름:날짜" 예) VISION_OCR:2026-11-26

    @Column(nullable = false)                                  // NOT NULL
    private int usedCount;                                     // 그날 호출 횟수
}
