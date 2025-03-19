package dev.auth.demo.oauth;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

import dev.auth.demo.model.User;
import dev.auth.demo.service.UserService;

@Component
public class OidcUserInfoCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {
    private final UserService userService;

    public OidcUserInfoCustomizer(@Lazy UserService userService) {
        this.userService = userService;
    }

    @Override
    public void customize(JwtEncodingContext context) {
        // ID 토큰에 사용자 정보 추가
        if (context.getTokenType().getValue().equals("id_token")) {
            String username = context.getPrincipal().getName();
            User user = userService.findByUsername(username);
            
            if (user != null) {
                OidcUserInfo userInfo = OidcUserInfo.builder()
                    .subject(username)
                    .name(user.getName())
                    .email(user.getEmail())
                    .preferredUsername(user.getUsername())
                    .build();
                
                context.getClaims().claims(claims -> 
                    claims.putAll(userInfo.getClaims())
                );
            }
        }
        
        // 액세스 토큰에 권한 정보 추가
        if (context.getTokenType().getValue().equals("access_token")) {
            Authentication principal = context.getPrincipal();
            if (principal instanceof UsernamePasswordAuthenticationToken) {
                Set<String> authorities = principal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());
                
                context.getClaims().claim("authorities", authorities);
            }
        }
    }
}