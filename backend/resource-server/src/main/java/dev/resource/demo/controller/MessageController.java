package dev.resource.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MessageController {

    @GetMapping("/public/info")
    public Map<String, String> publicInfo() {
        return Map.of("message", "This is public information");
    }

    @GetMapping("/messages")
    public List<Map<String, String>> getMessages(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("sub");
        
        return Arrays.asList(
            Map.of("id", "1", "text", "안녕하세요, " + username + "님!", "timestamp", "2023-06-15T10:30:00Z"),
            Map.of("id", "2", "text", "OAuth2로 보호된 메시지입니다.", "timestamp", "2023-06-15T11:45:00Z"),
            Map.of("id", "3", "text", "이 메시지는 인증된 사용자만 볼 수 있습니다.", "timestamp", "2023-06-15T14:20:00Z")
        );
    }

    @GetMapping("/user-info")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "sub", jwt.getSubject(),
            "name", jwt.getClaimAsString("name"),
            "scope", jwt.getClaimAsStringList("scope"),
            "exp", jwt.getExpiresAt()
        );
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasAuthority('SCOPE_admin.access')")
    public Map<String, Object> getAdminDashboard(@AuthenticationPrincipal Jwt jwt) {
        String username = jwt.getClaimAsString("sub");
        
        return Map.of(
            "adminData", Map.of(
                "stats", Map.of(
                    "totalUsers", 126,
                    "activeUsers", 87,
                    "newUsersToday", 5
                ),
                "systemStatus", "정상",
                "lastUpdated", new Date().toString()
            ),
            "message", username + "님, 관리자 대시보드에 오신 것을 환영합니다."
        );
    }
    
    // 관리자 전용 사용자 목록 엔드포인트
    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('SCOPE_admin.access')")
    public List<Map<String, Object>> getUsers() {
        // 실제 애플리케이션에서는 데이터베이스에서 사용자 목록을 가져옴
        return Arrays.asList(
            Map.of("id", 1, "username", "user1", "email", "user1@example.com", "role", "USER"),
            Map.of("id", 2, "username", "admin", "email", "admin@example.com", "role", "ADMIN"),
            Map.of("id", 3, "username", "user2", "email", "user2@example.com", "role", "USER")
        );
    }
}    