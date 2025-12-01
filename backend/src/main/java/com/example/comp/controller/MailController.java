package com.example.comp.controller;

import com.example.comp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    @Autowired
    private EmailService emailService;


    @GetMapping("/")
    public String sendWelcomeEmail() {
        emailService.sendMail(
                "joshuaallwin94965@gmail.com",
                "You registered with the DuelCode !",
                "Hey there! Welcome to our service."
        );
        return "Email sent!";
    }
}
