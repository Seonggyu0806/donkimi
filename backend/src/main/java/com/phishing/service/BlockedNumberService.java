package com.phishing.service;

import com.phishing.domain.BlockedNumber;
import com.phishing.domain.User;
import com.phishing.dto.BlockedNumberDto;
import com.phishing.repository.BlockedNumberRepository;
import com.phishing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BlockedNumberService {

    private final BlockedNumberRepository blockedNumberRepository;
    private final UserRepository userRepository;

    // 숫자만 남기고 한국 국가번호(+82)를 0으로 변환 (안드로이드 CallBlockStore.normalize와 동일 규칙)
    private String normalize(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.startsWith("82") && digits.length() >= 9) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }

    @Transactional(readOnly = true)
    public List<BlockedNumberDto.Response> list(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        return blockedNumberRepository.findByUser(user).stream()
                .map(b -> new BlockedNumberDto.Response(b.getPhoneNumber()))
                .toList();
    }

    public BlockedNumberDto.Response add(Long userId, String rawNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        String number = normalize(rawNumber);
        if (number.isEmpty()) {
            throw new IllegalArgumentException("올바르지 않은 전화번호입니다");
        }

        if (!blockedNumberRepository.existsByUserAndPhoneNumber(user, number)) {
            blockedNumberRepository.save(new BlockedNumber(user, number));
        }
        return new BlockedNumberDto.Response(number);
    }

    public void remove(Long userId, String rawNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다"));

        String number = normalize(rawNumber);
        blockedNumberRepository.deleteByUserAndPhoneNumber(user, number);
    }
}
