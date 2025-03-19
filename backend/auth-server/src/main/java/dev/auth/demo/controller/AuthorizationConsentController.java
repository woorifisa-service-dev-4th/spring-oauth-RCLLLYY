package dev.auth.demo.controller;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Controller
public class AuthorizationConsentController {

    private final RegisteredClientRepository registeredClientRepository;

    public AuthorizationConsentController(RegisteredClientRepository registeredClientRepository) {
        this.registeredClientRepository = registeredClientRepository;
    }

    @GetMapping("/oauth2/consent")
    public String consent(Principal principal, Model model,
                         @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                         @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
                         @RequestParam(OAuth2ParameterNames.STATE) String state,
                         @RequestParam(value = OAuth2ParameterNames.REDIRECT_URI, required = false) String redirectUri) {
    
        RegisteredClient client = this.registeredClientRepository.findByClientId(clientId);
        if (client == null) {
            throw new IllegalArgumentException("Invalid client");
        }
    
        Set<String> scopesToApprove = new HashSet<>();
        String[] scopeArray = scope.split(" ");
        for (String s : scopeArray) {
            scopesToApprove.add(s);
        }
    
        model.addAttribute("clientId", clientId);
        model.addAttribute("clientName", client.getClientName() != null ? client.getClientName() : clientId);
        model.addAttribute("state", state);
        model.addAttribute("scopes", scopesToApprove);
        model.addAttribute("principalName", principal.getName());
        model.addAttribute("redirectUri", redirectUri);
    
        return "consent";
    }
    
    @PostMapping("/oauth2/consent")
    public String consent(Principal principal,
                         @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
                         @RequestParam(OAuth2ParameterNames.STATE) String state,
                         @RequestParam(name = "scope") Set<String> scopes,
                         @RequestParam(value = OAuth2ParameterNames.REDIRECT_URI, required = false) String redirectUri) {
    
        // 클라이언트 등록 정보에서 등록된 redirect_uri 가져오기
        RegisteredClient client = this.registeredClientRepository.findByClientId(clientId);
        if (client == null) {
            throw new IllegalArgumentException("Invalid client");
        }
        
        // redirect_uri 파라미터가 없으면 클라이언트의 첫번째 redirect_uri 사용
        if (redirectUri == null) {
            redirectUri = client.getRedirectUris().iterator().next();
        }
    
        String authorizeUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/oauth2/authorize")
                .queryParam(OAuth2ParameterNames.RESPONSE_TYPE, "code")
                .queryParam(OAuth2ParameterNames.CLIENT_ID, clientId)
                .queryParam(OAuth2ParameterNames.REDIRECT_URI, redirectUri)
                .queryParam(OAuth2ParameterNames.STATE, state)
                .queryParam(OAuth2ParameterNames.SCOPE, String.join(" ", scopes))
                .queryParam("approved", true)
                .toUriString();
    
        return "redirect:" + authorizeUri;
    }
}