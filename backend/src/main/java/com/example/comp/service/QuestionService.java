package com.example.comp.service;

import com.example.comp.dto.QuestionDTO;
import com.example.comp.model.Question;
import com.example.comp.model.QuestionElastic;
import com.example.comp.repo.elastic.QuestionElasticRepo;
import com.example.comp.repo.QuestionRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
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
        dto.setDifficulty(question.getDifficulty().toString());
        dto.setStdIn(question.getStdIn());
        dto.setExpectedOutput(question.getExpectedOutput());
        return dto;
    }

    public Question getQuestionById(UUID id) {
        String cacheKey = "question::" + id;
        Question cachedQuestion = (Question) redis.opsForValue().get(cacheKey);
        if (cachedQuestion != null) {
            return cachedQuestion;
        }
        
        Question question = questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        redis.opsForValue().set(cacheKey, question);
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
        if(!StringUtils.hasText(name)){
            log.warn("findByQuestionName called with empty name");
            return null;
        }
        return questionElasticRepo.findByTitle(name);
    }

    public boolean containsByTitle(String title){
        return questionElasticRepo.existsByTitle(title);
    }
}
