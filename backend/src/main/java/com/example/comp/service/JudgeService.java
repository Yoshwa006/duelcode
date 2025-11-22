package com.example.comp.service;

import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.model.Users;
import com.example.comp.repo.QuestionRepo;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import com.example.comp.util.Status;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JudgeService {

    @Autowired private SessionRepo sessionRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private JwtService jwtService;
    @Autowired private QuestionRepo questionRepo;

    public String generateKey(UUID quesId) {

        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();

        String token;
        do {
            token = random.ints(4, 0, chars.length())
                    .mapToObj(i -> String.valueOf(chars.charAt(i)))
                    .collect(Collectors.joining());
        } while (sessionRepo.existsByToken(token));

        Question question = questionRepo.findById(quesId)
                .orElseThrow(() -> new RuntimeException("Invalid question id: " + quesId));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "";
        }
        Object principal = auth.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            return "";
        }
        Users user = userRepo.findByEmail(username);
        if(user == null){
            throw new RuntimeException("User not present !");
        }

        Session session = new Session(token, user, question);
        sessionRepo.save(session);

        log.info("Generated Token: {}", token);
        return token;
    }

    public boolean joinRandom(){

        Session session = sessionRepo.findTopByJoinedByIsNullOrderByCreatedAtDesc();
        if(session == null){
            return false;
        }
        if(session.getJoinedBy() != null){
            System.out.println("Someone already joined !");
            return false;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        Object principal = auth.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            return false;
        }
        Users user = userRepo.findByEmail(username);
        if(user == null){
            throw new RuntimeException("User not present !");
        }
        log.info("User joining session: {}, session token: {}", username);
        session.setJoinedBy(user);
        session.setStatus(Status.STATUS_PLAYING);
        sessionRepo.save(session);
        return true;
    }

    public boolean enterToken(String token){

        Session session = sessionRepo.findByToken(token);
        if(session == null){
            throw new RuntimeException("Session not found !");
        }
        if(session.getJoinedBy() != null){
            System.out.println("Someone already joined !");
            return false;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        Object principal = auth.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal; // sometimes it's the username string
        } else {
            return false;
        }


        Users user = userRepo.findByEmail(username);
        if(user == null){
            throw new RuntimeException("User not found !");
        }
        session.setJoinedBy(user);
        session.setStatus(Status.STATUS_PLAYING);
        sessionRepo.save(session);
        return true;
    }

}
