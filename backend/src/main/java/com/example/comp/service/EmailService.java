package com.example.comp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender sender;

    public void sendMail(String from, String to, String content){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setText(content);
        message.setFrom(from);

        sender.send(message);
    }
}
