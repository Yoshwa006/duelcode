package com.example.comp.service;

import com.example.comp.dto.QuestionDTO;
import com.example.comp.model.Question;
import com.example.comp.model.QuestionElastic;
import com.example.comp.repo.QuestionElasticRepo;
import com.example.comp.repo.QuestionRepo;
import io.netty.util.internal.StringUtil;
import org.hibernate.exception.DataException;
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
    @Autowired
    QuestionElasticRepo questionElasticRepo;

    public List<QuestionDTO> getAllQuestions() {
            return questionRepo.findAll()
                    .stream()
                    .map(this::toQuestionDTO)
                    .toList();
        }

    public QuestionDTO toQuestionDTO(Question question) {
        if (question == null) {
            return null;
        }

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty());
        dto.setStdIn(question.getStdIn());
        dto.setExpectedOutput(question.getExpectedOutput());
        return dto;
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

    public String saveQuestion(QuestionElastic request) {

        if (request == null) {
            return "Request body is empty.";
        }

        try {
            if (request.getId() == null) {
                request.setId(UUID.randomUUID());
            }

            questionElasticRepo.save(request);
            return "Question saved successfully with ID: " + request.getId();
        }
        catch (Exception e) {
            return "Error occurred while saving: " + e.getMessage();
        }
    }

    public QuestionElastic findByQuestionName(String name){
        if(StringUtil.isNullOrEmpty(name)){
            System.out.println("Name is empty !");
        }
        return questionElasticRepo.findByTitle(name);
    }

    public boolean containsByTitle(String title){
        return questionElasticRepo.existsByTitle(title);
    }
}
