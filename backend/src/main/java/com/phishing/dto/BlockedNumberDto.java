package com.phishing.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

public class BlockedNumberDto {

    @Getter
    @NoArgsConstructor
    public static class Request {
        // POST /api/v1/blocklist 요청 바디, DELETE /api/v1/blocklist/{number}는 경로변수 사용

        private String number;
    }

    @Getter
    public static class Response {
        // 차단 번호 목록/등록 응답

        private String number;

        public Response(String number) {
            this.number = number;
        }
    }
}
