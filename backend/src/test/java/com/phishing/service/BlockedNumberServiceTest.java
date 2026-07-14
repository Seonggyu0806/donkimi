package com.phishing.service;

import com.phishing.domain.BlockedNumber;
import com.phishing.domain.User;
import com.phishing.dto.BlockedNumberDto;
import com.phishing.repository.BlockedNumberRepository;
import com.phishing.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * 차단 번호 서비스 단위 테스트 (DB 없이 Mockito로 저장소를 대체).
 * 계정 종속 차단의 핵심인 "번호 정규화"와 "중복 차단 방지"를 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class BlockedNumberServiceTest {

    @Mock BlockedNumberRepository blockedNumberRepository;
    @Mock UserRepository userRepository;
    @InjectMocks BlockedNumberService service;

    private static final Long USER_ID = 1L;

    private void givenUserExists() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
    }

    @Test
    @DisplayName("하이픈·공백이 섞인 번호는 숫자만 남겨 저장한다")
    void add_stripsNonDigits() {
        givenUserExists();
        when(blockedNumberRepository.existsByUserAndPhoneNumber(any(), anyString())).thenReturn(false);

        BlockedNumberDto.Response res = service.add(USER_ID, "010-1234-5678");

        ArgumentCaptor<BlockedNumber> captor = ArgumentCaptor.forClass(BlockedNumber.class);
        verify(blockedNumberRepository).save(captor.capture());
        assertThat(captor.getValue().getPhoneNumber()).isEqualTo("01012345678");
        assertThat(res.getNumber()).isEqualTo("01012345678");
    }

    @Test
    @DisplayName("국가번호 +82는 0으로 변환한다 (앱 네이티브 정규화와 동일)")
    void add_normalizesKoreaCountryCode() {
        givenUserExists();
        when(blockedNumberRepository.existsByUserAndPhoneNumber(any(), anyString())).thenReturn(false);

        service.add(USER_ID, "+82 10-1234-5678");

        ArgumentCaptor<BlockedNumber> captor = ArgumentCaptor.forClass(BlockedNumber.class);
        verify(blockedNumberRepository).save(captor.capture());
        assertThat(captor.getValue().getPhoneNumber()).isEqualTo("01012345678");
    }

    @Test
    @DisplayName("이미 차단된 번호는 다시 저장하지 않는다 (중복 방지)")
    void add_skipsSaveWhenAlreadyBlocked() {
        givenUserExists();
        when(blockedNumberRepository.existsByUserAndPhoneNumber(any(), eq("01012345678"))).thenReturn(true);

        BlockedNumberDto.Response res = service.add(USER_ID, "010-1234-5678");

        verify(blockedNumberRepository, never()).save(any());
        assertThat(res.getNumber()).isEqualTo("01012345678"); // 응답은 정상 반환
    }

    @Test
    @DisplayName("숫자가 하나도 없는 입력은 예외")
    void add_rejectsEmptyNumber() {
        givenUserExists();

        assertThatThrownBy(() -> service.add(USER_ID, "-- --"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(blockedNumberRepository, never()).save(any());
    }

    @Test
    @DisplayName("존재하지 않는 유저면 예외")
    void add_rejectsUnknownUser() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.add(USER_ID, "010-1234-5678"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
