package com.example.comp.exception;

import com.example.comp.dto.OperationStatusResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "FAILED");
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("errorCode", 400);
        
        log.warn("Validation error: {}", errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<OperationStatusResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        OperationStatusResponse response = new OperationStatusResponse();
        response.setStatus("FAILED");
        response.setMessage(ex.getMessage());
        response.setErrorCode(400);
        
        log.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<OperationStatusResponse> handleSecurityException(SecurityException ex) {
        OperationStatusResponse response = new OperationStatusResponse();
        response.setStatus("FAILED");
        response.setMessage(ex.getMessage());
        response.setErrorCode(401);
        
        log.warn("Security exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<OperationStatusResponse> handleAuthenticationException(AuthenticationException ex) {
        OperationStatusResponse response = new OperationStatusResponse();
        response.setStatus("FAILED");
        response.setMessage("Authentication failed: " + ex.getMessage());
        response.setErrorCode(401);
        
        log.warn("Authentication exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<OperationStatusResponse> handleRuntimeException(RuntimeException ex) {
        OperationStatusResponse response = new OperationStatusResponse();
        response.setStatus("FAILED");
        response.setMessage(ex.getMessage());
        response.setErrorCode(500);
        
        log.error("Runtime exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<OperationStatusResponse> handleGenericException(Exception ex) {
        OperationStatusResponse response = new OperationStatusResponse();
        response.setStatus("FAILED");
        response.setMessage("An unexpected error occurred");
        response.setErrorCode(500);
        
        log.error("Unexpected exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

