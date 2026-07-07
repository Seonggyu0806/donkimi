package com.phishing.repository;

import com.phishing.domain.BlockedNumber;
import com.phishing.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlockedNumberRepository extends JpaRepository<BlockedNumber, Long> {

    List<BlockedNumber> findByUser(User user);
    // 내 차단 번호 목록 조회 (기기 복원/신규 기기 동기화용)

    Optional<BlockedNumber> findByUserAndPhoneNumber(User user, String phoneNumber);

    boolean existsByUserAndPhoneNumber(User user, String phoneNumber);

    void deleteByUserAndPhoneNumber(User user, String phoneNumber);
}
