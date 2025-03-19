package dev.auth.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.ServletWebRequest;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
public class OAuthErrorController {

    @GetMapping("/oauth2/error")
    public ResponseEntity<Map<String, Object>> handleOAuthError(HttpServletRequest request) {
        String error = request.getParameter("error");
        String errorDescription = request.getParameter("error_description");
        
        if (error == null) {
            error = "server_error";
        }
        
        if (errorDescription == null) {
            errorDescription = "An error occurred during the OAuth2 authorization process";
        }
        
        Map<String, Object> errorResponse = Map.of(
            "error", error,
            "error_description", errorDescription,
            "status", HttpStatus.BAD_REQUEST.value()
        );
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(errorResponse);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, ServletWebRequest request) {
        String errorMessage = ex.getMessage();
        if (errorMessage == null || errorMessage.isEmpty()) {
            errorMessage = "An unexpected error occurred";
        }
        
        Map<String, Object> errorResponse = Map.of(
            "error", OAuth2ErrorCodes.SERVER_ERROR,
            "error_description", errorMessage,
            "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "path", request.getRequest().getRequestURI()
        );
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(errorResponse);
    }
}