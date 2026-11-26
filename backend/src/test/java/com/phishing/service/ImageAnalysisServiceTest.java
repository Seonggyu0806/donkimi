package com.phishing.service;

import com.phishing.repository.UrlAnalysisRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 이미지 분석 서비스 단위 테스트.
 * OCR 하루 상한을 넘으면 안내 메시지를 돌려주고, 유료인 OpenAI도 부르지 않는지 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class ImageAnalysisServiceTest {

    @Mock OcrService ocrService;
    @Mock OpenAiService openAiService;
    @Mock UrlAnalysisRepository urlAnalysisRepository;
    @InjectMocks ImageAnalysisService service;

    @Test
    @DisplayName("OCR 하루 상한을 넘으면 한도 안내 에러를 돌려주고 OpenAI는 부르지 않는다")
    void analyzeImages_dailyLimitExceeded_returnsLimitErrorWithoutOpenAi() {
        MultipartFile file = mock(MultipartFile.class);
        when(ocrService.extractTextFromImage(file))
                .thenThrow(new ApiUsageLimiter.DailyLimitExceededException("VISION_OCR", 30));

        Map<String, Object> result = service.analyzeImages(List.of(file), null);

        assertThat(result).containsKey("error");
        assertThat((String) result.get("error")).contains("한도");
        verify(openAiService, never()).analyzeImage(anyString());
        verify(urlAnalysisRepository, never()).save(any());
    }
}
