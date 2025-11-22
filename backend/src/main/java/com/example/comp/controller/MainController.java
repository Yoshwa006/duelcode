package com.example.comp.controller;

import com.example.comp.dto.OperationStatusResponse;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.service.JudgeService;
import com.example.comp.service.SubmitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class MainController {

    @Autowired
    private JudgeService judgeService;

    @Autowired
    private SubmitService submitService;

    @PostMapping("/generate")
    public ResponseEntity<OperationStatusResponse> generate(@RequestBody UUID questionId) {
        OperationStatusResponse res = judgeService.generateKey(questionId);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    @PostMapping("/submit")
    public ResponseEntity<OperationStatusResponse> submitAnswer(@RequestBody SubmitRequest request) {
        OperationStatusResponse res = submitService.submitCode(request);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    @PostMapping("/join-random")
    public ResponseEntity<OperationStatusResponse> joinRandom() {
        OperationStatusResponse res = judgeService.joinRandom();
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    @GetMapping("/join-key")
    public ResponseEntity<OperationStatusResponse> joinWithKey(@RequestParam String key) {
        OperationStatusResponse res = judgeService.enterToken(key);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    private HttpStatus mapStatus(int code) {
        return switch (code) {
            case 0 -> HttpStatus.OK;
            case 400 -> HttpStatus.BAD_REQUEST;
            case 401 -> HttpStatus.UNAUTHORIZED;
            case 403 -> HttpStatus.FORBIDDEN;
            case 404 -> HttpStatus.NOT_FOUND;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
