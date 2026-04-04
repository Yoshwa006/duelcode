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
import com.example.comp.repo.SessionRepo;
import com.example.comp.model.Session;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MatchController {

    @Autowired
    private JudgeService judgeService;
    @Autowired
    private SubmitService submitService;
    @Autowired
    private SessionService sessionService;
    @Autowired
    private SessionRepo sessionRepo;

    @GetMapping("/match/{token}")
    public ResponseEntity<?> getMatchByToken(@PathVariable String token) {
        Session session = sessionRepo.findByToken(token);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", session.getToken());
        response.put("status", session.getStatus());
        if (session.getCreatedBy() != null) {
            response.put("createdBy", session.getCreatedBy().getUsername());
        }
        if (session.getJoinedBy() != null) {
            response.put("joinedBy", session.getJoinedBy().getUsername());
        }
        
        if (session.getQuestion() != null) {
            java.util.Map<String, Object> questionMap = new java.util.HashMap<>();
            questionMap.put("id", session.getQuestion().getId());
            questionMap.put("title", session.getQuestion().getTitle());
            questionMap.put("description", session.getQuestion().getDescription());
            questionMap.put("difficulty", session.getQuestion().getDifficulty());
            questionMap.put("stdIn", session.getQuestion().getStdIn());
            questionMap.put("expectedOutput", session.getQuestion().getExpectedOutput());
            response.put("question", questionMap);
        }
        
        return ResponseEntity.ok(response);
    }

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

    @PostMapping("/join-key")
    public ResponseEntity<OperationStatusResponse> joinWithKey(@RequestBody java.util.Map<String, String> request) {
        String key = request.get("key");
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
    public List<SessionResponseDTO> searchSessions(@RequestBody SessionSearchRequestDTO requestDTO) {
        return sessionService.searchSessions(requestDTO);
    }

    @GetMapping("/my-session")
    public ResponseEntity<?> getMyActiveSession() {
        Session session = sessionService.getMyActiveSession();
        if (session == null) {
            return ResponseEntity.ok().body(null);
        }
        return ResponseEntity.ok().body(java.util.Map.of(
            "token", session.getToken(),
            "status", session.getStatus(),
            "questionTitle", session.getQuestion() != null ? session.getQuestion().getTitle() : null
        ));
    }

    @PostMapping("/surrender")
    public ResponseEntity<OperationStatusResponse> surrender(@RequestParam String token) {
        OperationStatusResponse res = judgeService.surrender(token);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<OperationStatusResponse> cancel(@RequestParam String token) {
        OperationStatusResponse res = judgeService.cancelSession(token);
        return new ResponseEntity<>(res, mapStatus(res.getErrorCode()));
    }

}
