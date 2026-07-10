package com.phishing.repository;

import com.phishing.domain.AnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UrlAnalysisRepository extends JpaRepository<AnalysisHistory, Long> {

    // 🌟 1. 기존 코드: isHelpful 값이 true(또는 false)인 데이터의 개수를 세어라!
    long countByIsHelpful(Boolean isHelpful);

    // 🌟 2. 추가된 마법의 코드: 특정 유저(userId)의 모든 분석 이력을 최신순으로 가져와라!
    List<AnalysisHistory> findByUserIdOrderByAnalyzedAtDesc(Long userId);

    void deleteByUserId(Long userId);
    // 회원 탈퇴 시 분석 이력 전체 삭제

    @Query("SELECT a.type, COUNT(a) FROM AnalysisHistory a WHERE a.type IS NOT NULL GROUP BY a.type")
    List<Object[]> countGroupByType();
    // 전체 사용자의 분석 종류별 진단 건수 (홈 화면 통계 배너)
}