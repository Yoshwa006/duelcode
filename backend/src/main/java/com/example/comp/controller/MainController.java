package com.example.comp.controller;

import com.example.comp.dto.EnterKey;
import com.example.comp.dto.GenerateKey;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.service.JudgeService;
import com.example.comp.service.SubmitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MainController {

    @Autowired
    private JudgeService judgeService;
    @Autowired
    private SubmitService submitService;


    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestBody GenerateKey generateKey) {
        System.out.println("JWt: " + generateKey.getJwt());
        return ResponseEntity.ok().body(judgeService.generateKey(generateKey.getJwt(), generateKey.getQuestionId()));
    }

    @PostMapping("/submit")
    public ResponseEntity<Boolean> createQuestion(@RequestBody SubmitRequest request) {
        boolean status = submitService.submitCode(request);
        if (!status) {
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(true);
    }
    
}
