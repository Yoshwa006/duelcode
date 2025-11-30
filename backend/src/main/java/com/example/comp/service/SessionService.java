package com.example.comp.service;

import com.example.comp.dto.SessionResponseDTO;
import com.example.comp.dto.SessionSearchRequestDTO;
import com.example.comp.model.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SessionService {
    @Autowired
    private CustomSessionRepository service;

    public List<SessionResponseDTO> searchSessions(SessionSearchRequestDTO requestDTO){
        return service.searchSessions(requestDTO)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private SessionResponseDTO toDTO(Session s) {
        SessionResponseDTO dto = new SessionResponseDTO();
        dto.setId(s.getId().toString());
        dto.setToken(s.getToken());
        dto.setCreatorEmail(
                s.getCreatedBy() != null ? s.getCreatedBy().getEmail() : null
        );
        dto.setJoinedByEmail(
                s.getJoinedBy() != null ? s.getJoinedBy().getEmail() : null
        );
        dto.setQuestionTitle(
                s.getQuestion() != null ? s.getQuestion().getTitle() : null
        );
        dto.setDifficulty(
                s.getQuestion() != null ? s.getQuestion().getDifficulty() : null
        );
        dto.setStatus(s.getStatus().toString());
        dto.setCreatedUserName(s.getCreatedBy().getUsername());
        dto.setJoinedUserName(s.getJoinedBy().getUsername());
        dto.setCreatedAt(s.getCreatedAt().toString());
        return dto;
    }
}
