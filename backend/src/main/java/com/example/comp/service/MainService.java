package com.example.comp.service;

import com.example.comp.model.Question;
import com.example.comp.model.Session;
import com.example.comp.repo.QuestionRepo;
import com.example.comp.repo.SessionRepo;
import com.example.comp.repo.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
public class MainService {

    private final QuestionRepo questionRepo;
    private final SessionRepo sessionRepo;
    private final UserRepo userRepo;
    private final JwtService jwtService;

    @Autowired
    public MainService(QuestionRepo questionRepo, SessionRepo sessionRepo, UserRepo userRepo,
                       JwtService jwtService) {
        this.questionRepo = questionRepo;
        this.sessionRepo = sessionRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;

    }

    public List<Question> getAllQuestions() {
        return questionRepo.findAll();
    }

    public Question getQuestionById(Long id) {
        return questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    public Question createQuestion(Question question) {
        return questionRepo.save(question);
    }

    public Question updateQuestion(Long id, Question questionDetails) {
        Question question = getQuestionById(id);
        question.setTitle(questionDetails.getTitle());
        question.setDifficulty(questionDetails.getDifficulty());
        question.setDescription(questionDetails.getDescription());
        return questionRepo.save(question);
    }



    public String generateKey(String jwt, int quesId) {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        String token;

        do {
            token = random.ints(4, 0, chars.length())
                    .mapToObj(chars::charAt)
                    .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                    .toString();
        } while (sessionRepo.existsByToken(token)); // ensures uniqueness

        String finalToken = token;
        userRepo.findIdByEmail(jwtService.extractUsername(jwt))
                .ifPresent(id -> sessionRepo.save(new Session(finalToken, Math.toIntExact(id), quesId)));

        log.info("Generated Token: {}", token);
        return token;
    }



    public int enterToken(String jwt, String token) {
        String email = jwtService.extractUsername(jwt);
        Optional<Long> optionalUserId = userRepo.findIdByEmail(email);
        if (optionalUserId.isEmpty()) {
            throw new RuntimeException("Email not found");
        }
        int userId = Math.toIntExact(optionalUserId.get());

        Session session = sessionRepo.findByToken(token);
        if (session == null) {
            throw new RuntimeException("Invalid token");
        }

        // If someone already joined who is not this user, reject
        if (session.getJoinedBy() != 0 && session.getJoinedBy() != userId) {
            throw new RuntimeException("Session already full");
        }

        // If user is creator, don't set joinedBy again
        if (session.getCreatedBy() == userId) {
            return -1;
        }

        if (session.getJoinedBy() == 0) {
            session.setJoinedBy(userId);
            sessionRepo.save(session);
        }

        return session.getQuestion_id();
    }


    public boolean polling(String ctoken){
       int joinedBy = sessionRepo.findJoinedByByToken(ctoken);
        System.out.println("Polling for session: " + joinedBy);
        return joinedBy != 0;
    }



}
