package com.phishing.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity                                                          // DB 테이블과 연결
@Table(name = "blocked_numbers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "phone_number"}))
@Getter
@NoArgsConstructor
public class BlockedNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)                            // N:1 관계 (여러 차단 번호 → 한 명의 유저)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "phone_number", nullable = false)              // 정규화된 번호 (숫자만)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public BlockedNumber(User user, String phoneNumber) {
        this.user = user;
        this.phoneNumber = phoneNumber;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
