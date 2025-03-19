package dev.auth.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.auth.demo.model.User;
import dev.auth.demo.service.UserService;

@RestController
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 현재 인증된 사용자 정보를 반환합니다.
     */
    @GetMapping("/api/user")
    public Map<String, Object> user(Authentication authentication) {
        Map<String, Object> userInfo = new HashMap<>();
        if (authentication != null) {
            userInfo.put("username", authentication.getName());
            userInfo.put("authorities", authentication.getAuthorities());
        }
        return userInfo;
    }

    /**
     * 커스텀 UserInfo 엔드포인트
     */
    @GetMapping("/api/userinfo")
    public Map<String, Object> userInfo(@AuthenticationPrincipal OAuth2AuthenticatedPrincipal principal) {
        Map<String, Object> userInfo = new HashMap<>();
        
        if (principal != null) {
            String username = principal.getName();
            User user = userService.findByUsername(username);
            
            userInfo.put("sub", username);
            
            if (user != null) {
                userInfo.put("name", user.getName());
                userInfo.put("email", user.getEmail());
                userInfo.put("preferred_username", user.getUsername());
            }
        }
        
        return userInfo;
    }

    /**
     * 인증 서버 상태를 확인하는 헬스 체크 엔드포인트
     */
    @GetMapping("/api/health")
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "Auth Server");
        return status;
    }
}