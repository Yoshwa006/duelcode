package com.example.comp.service;

import com.example.comp.model.Question;
import com.example.comp.repo.QuestionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepo questionRepo;
    @Autowired
    RedisTemplate<String, Object> redis;

    public List<Question> getAllQuestions() {
        return questionRepo.findAll();
    }

    public Question getQuestionById(UUID id) {
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        redis.opsForValue().set("question::", question);
        return question;
    }
    public Question createQuestion(Question question) {
        return questionRepo.save(question);
    }

    public Question updateQuestion(UUID id, Question questionDetails) {
        Question question = getQuestionById(id);
        question.setTitle(questionDetails.getTitle());
        question.setDifficulty(questionDetails.getDifficulty());
        question.setDescription(questionDetails.getDescription());
        return questionRepo.save(question);
    }



}
