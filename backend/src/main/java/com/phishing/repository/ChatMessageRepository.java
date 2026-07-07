package com.phishing.repository;

import com.phishing.domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(String sessionId);

    void deleteBySessionIdIn(List<String> sessionIds);
    // 회원 탈퇴 시 해당 유저 세션들의 메시지 전체 삭제
}