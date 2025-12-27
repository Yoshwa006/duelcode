package com.example.comp.controller;

import com.example.comp.dto.*;
import com.example.comp.model.UserStats;
import com.example.comp.repo.UserStatsRepo;
import com.example.comp.service.JudgeService;
import com.example.comp.service.SessionService;
import com.example.comp.service.SubmitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class MainController {

    @Autowired private JudgeService judgeService;
    @Autowired private SubmitService submitService;
    @Autowired private SessionService sessionService;
    @Autowired private UserStatsRepo userStatsRepo;

    @PostMapping("/generate")
    public String generate(@RequestBody GenerateRequest request) {
        return judgeService.generateKey(request.getQuestionId());
    }

    @PostMapping("/submit")
    public ResponseEntity<OperationStatusResponse> submitAnswer(@RequestBody SubmitRequest request) {
        OperationStatusResponse res = submitService.submitCode(request);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    @GetMapping("/join-random")
    public ResponseEntity<OperationStatusResponse> joinRandom() {
        boolean joined = judgeService.joinRandom();
        OperationStatusResponse res = new OperationStatusResponse();
        if (joined) {
            res.setStatus("SUCCESS");
            res.setMessage("Successfully joined a random session");
            res.setErrorCode(0);
        } else {
            res.setStatus("FAILED");
            res.setMessage("No available sessions to join");
            res.setErrorCode(404);
        }
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

    @PostMapping("/search")
    public List<SessionResponseDTO> searchSessions(@RequestBody SessionSearchRequestDTO requestDTO){
        return sessionService.searchSessions(requestDTO);
    }

    @GetMapping("/leaderboard")
    public List<UserStats> leaderboard() {
        return userStatsRepo.findTop100ByOrderByEloRatingDesc();
    }

}
