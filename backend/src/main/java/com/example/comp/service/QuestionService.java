package com.example.comp.service;

import com.example.comp.model.Question;
import com.example.comp.repo.QuestionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepo questionRepo;


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



}
