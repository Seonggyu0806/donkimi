package com.phishing.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // 🌟 추가된 핵심 로직: 특정 조건에서는 이 필터(검색대)를 아예 건너뜁니다!
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // 주의: /analysis/url·image·voice 는 여기서 제외하면 안 됨.
        // 이 필터를 건너뛰면 로그인 토큰을 못 읽어 userId=null → 분석 이력이 사용자에 저장되지 않음.
        // (이 경로들은 permitAll 이라 토큰이 없어도 익명으로 동작하고, 토큰이 있으면 userId를 잡아 이력 저장)
        return request.getMethod().equals("OPTIONS") ||
                path.equals("/api/v1/analysis/history/test") ||
                path.startsWith("/api/v1/phishing") ||
                path.equals("/api/v1/users/login") ||
                path.equals("/api/v1/users/oauth/google") ||
                path.equals("/api/v1/users") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                if (jwtUtil.validateToken(token)) {
                    Long userId = jwtUtil.getUserId(token);
                    String role = jwtUtil.getRole(token);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"success\":false,\"message\":\"" + e.getMessage() + "\",\"data\":null}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}