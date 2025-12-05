package com.example.comp.controller;

import com.example.comp.dto.auth.AuthRequest;
import com.example.comp.dto.auth.AuthResponse;
import com.example.comp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@jakarta.validation.Valid @RequestBody AuthRequest authRequest) {
        authService.register(authRequest);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@jakarta.validation.Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.login(authRequest);

        if (!response.getValid()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        return ResponseEntity.ok(response.getToken());
    }


}
