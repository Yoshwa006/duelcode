package com.example.comp.service;

import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.QuestionRepo;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import com.fasterxml.jackson.databind.DatabindException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Slf4j
@Service
public class JudgeService {

    @Autowired private  SessionRepo sessionRepo;
    @Autowired private  UserRepo userRepo;
    @Autowired private  JwtService jwtService;
    @Autowired QuestionRepo questionRepo;

    public String generateKey(String jwt, int quesId) {

        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();

        String token;
        do {
            token = random.ints(4, 0, chars.length())
                    .mapToObj(i -> String.valueOf(chars.charAt(i)))
                    .collect(Collectors.joining());
        } while (sessionRepo.existsByToken(token));

        Question question = questionRepo.findById((long) quesId)
                .orElseThrow(() -> new RuntimeException("Invalid question id: " + quesId));
        if (question == null) {
            return token;
        }
        Users user = userRepo.findIdByEmail(jwtService.extractUsername(jwt))
                .flatMap(userRepo::findById)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user == null) {
            return token;
        }

        Session session = new Session(token, user, question);
        sessionRepo.save(session);

        log.info("Generated Token: {}", token);
        return token;
    }

}
