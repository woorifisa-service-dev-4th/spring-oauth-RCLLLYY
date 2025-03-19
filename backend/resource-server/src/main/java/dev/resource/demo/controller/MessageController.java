package dev.resource.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
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
}