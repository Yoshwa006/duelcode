package com.example.comp.service;

import com.example.comp.dto.MatchHistoryDataDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CustomUserMatchHistoryRepo {

    @PersistenceContext
    EntityManager em;

//    public List<MatchHistoryDataDTO> getHistoryDetails(){
//
//    }
}
