package com.phishing.controller;

import com.phishing.dto.BlockedNumberDto;
import com.phishing.service.BlockedNumberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/blocklist")
@RequiredArgsConstructor
@Tag(name = "차단 번호 API", description = "계정별 차단 번호 목록 조회/등록/해제 (기기 로컬 차단 목록의 클라우드 백업/동기화용)")
public class BlockedNumberController {

    private final BlockedNumberService blockedNumberService;

    @GetMapping
    @Operation(summary = "내 차단 번호 목록", description = "로그인한 계정에 저장된 차단 번호 목록을 조회합니다")
    public ResponseEntity<Map<String, Object>> list() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<BlockedNumberDto.Response> response = blockedNumberService.list(userId);
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @PostMapping
    @Operation(summary = "차단 번호 등록", description = "계정에 차단 번호를 등록합니다 (이미 등록된 번호면 그대로 유지)")
    public ResponseEntity<Map<String, Object>> add(@RequestBody BlockedNumberDto.Request request) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        BlockedNumberDto.Response response = blockedNumberService.add(userId, request.getNumber());
        return ResponseEntity.ok(success("성공했습니다", response));
    }

    @DeleteMapping("/{phoneNumber}")
    @Operation(summary = "차단 번호 해제", description = "계정에서 차단 번호를 삭제합니다")
    public ResponseEntity<Map<String, Object>> remove(@PathVariable String phoneNumber) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        blockedNumberService.remove(userId, phoneNumber);
        return ResponseEntity.ok(success("성공했습니다", null));
    }

    private Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}
