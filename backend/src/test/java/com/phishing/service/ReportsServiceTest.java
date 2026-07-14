package com.phishing.service;

import com.phishing.domain.PhoneReport;
import com.phishing.domain.PhoneReportLog;
import com.phishing.domain.User;
import com.phishing.dto.ReportsDto;
import com.phishing.repository.PhoneReportLogRepository;
import com.phishing.repository.PhoneReportRepository;
import com.phishing.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * 전화번호 신고 서비스 단위 테스트.
 * 신고 어뷰징 방지의 핵심인 "같은 유저가 같은 번호를 중복 신고하면 카운트가 오르지 않는다"를 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class ReportsServiceTest {

    @Mock PhoneReportRepository phoneReportRepository;
    @Mock PhoneReportLogRepository phoneReportLogRepository;
    @Mock UserRepository userRepository;
    @InjectMocks ReportsService service;

    private static final Long USER_ID = 1L;

    private ReportsDto.ReportRequest request(String number) {
        ReportsDto.ReportRequest req = mock(ReportsDto.ReportRequest.class);
        when(req.getNumber()).thenReturn(number);
        return req;
    }

    @Test
    @DisplayName("처음 신고되는 번호는 새로 생성되고 신고가 접수된다")
    void report_newNumber_isAccepted() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
        when(phoneReportRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(phoneReportLogRepository.existsByUserAndPhoneReport(any(), any())).thenReturn(false);

        ReportsDto.ReportResponse res = service.report(USER_ID, request("010-1234-5678"));

        assertThat(res.isAlreadyReported()).isFalse();
        verify(phoneReportLogRepository).save(any(PhoneReportLog.class)); // 신고 로그 생성됨
    }

    @Test
    @DisplayName("같은 유저가 같은 번호를 다시 신고하면 카운트가 오르지 않는다 (어뷰징 방지)")
    void report_duplicateBySameUser_isBlocked() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
        when(phoneReportRepository.existsByPhoneNumber("01012345678")).thenReturn(true);
        when(phoneReportRepository.findByPhoneNumber("01012345678"))
                .thenReturn(Optional.of(new PhoneReport("01012345678")));
        when(phoneReportLogRepository.existsByUserAndPhoneReport(any(), any())).thenReturn(true);

        ReportsDto.ReportResponse res = service.report(USER_ID, request("010-1234-5678"));

        assertThat(res.isAlreadyReported()).isTrue();
        verify(phoneReportLogRepository, never()).save(any()); // 중복이라 로그 저장 안 함
    }

    @Test
    @DisplayName("신고 시 하이픈은 무시하고 숫자만으로 집계한다")
    void report_normalizesNumber() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(new User()));
        when(phoneReportRepository.existsByPhoneNumber("01012345678")).thenReturn(false);
        when(phoneReportLogRepository.existsByUserAndPhoneReport(any(), any())).thenReturn(false);

        // "010-1234-5678"로 신고해도 존재 여부는 "01012345678"로 조회돼야 한다
        service.report(USER_ID, request("010-1234-5678"));

        verify(phoneReportRepository).existsByPhoneNumber("01012345678");
    }
}
