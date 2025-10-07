package com.example.comp.controller;

import com.example.comp.dto.EnterKey;
import com.example.comp.dto.GenerateKey;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.service.MainService;
import com.example.comp.service.SubmitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MainController {

    private final MainService mainService;
    private final SubmitService submitService;


    @Autowired
    public MainController(MainService mainService, SubmitService submitService) {
        this.mainService = mainService;
        this.submitService = submitService;
    }


    // Generate token for question
    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestBody GenerateKey generateKey) {
        System.out.println("JWt: " + generateKey.getJwt());
        return ResponseEntity.ok().body(mainService.generateKey(generateKey.getJwt(), generateKey.getQuestionId()));
    }

    // Enter token for authentication
    @PostMapping("/enter")
    public ResponseEntity<Integer> enter(@RequestBody EnterKey em) {
        int n = mainService.enterToken(em.getJwt(), em.getToken());
        return ResponseEntity.ok().body(n);
    }

    // Get all questions
    @GetMapping
    public ResponseEntity<?> getAllQuestions() {
        return ResponseEntity.ok(mainService.getAllQuestions());
    }

    // Get question by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(mainService.getQuestionById(id));
    }

    // Submit code for question
    @PostMapping("/submit")
    public ResponseEntity<Boolean> createQuestion(@RequestBody SubmitRequest request) {
        boolean status = submitService.submitCode(request);
        if(!status){
            return ResponseEntity.status(404).build();
        }
        return ResponseEntity.ok(true);
    }

    // Polling for token status
    @GetMapping("/poll/{ctoken}")
    public ResponseEntity<Boolean> polling(@PathVariable String ctoken) {
        boolean check = mainService.polling(ctoken);
        System.out.println("Polling result: " + check);
        return ResponseEntity.ok().body(check);
    }
    
}
