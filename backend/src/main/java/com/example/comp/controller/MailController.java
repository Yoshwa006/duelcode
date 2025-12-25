package com.example.comp.controller;

import com.example.comp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    @Autowired
    private EmailService emailService;

    @Value("${app.mail.default-recipient:}")
    private String defaultRecipient;

    @GetMapping()
    public ResponseEntity<String> sendWelcomeEmail(@RequestParam(required = false) String to) {
        String recipient = (to != null && !to.isEmpty()) ? to : defaultRecipient;
        if (recipient == null || recipient.isEmpty()) {
            return ResponseEntity.badRequest().body("Recipient email is required");
        }
        emailService.sendMail(
                recipient,
                "Welcome to DuelCode!",
                "Hey there! Welcome to our service."
        );
        return ResponseEntity.ok("Email sent successfully!");
    }
}
