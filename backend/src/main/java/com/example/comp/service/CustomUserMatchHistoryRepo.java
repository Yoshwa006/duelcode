package com.example.comp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class CustomUserMatchHistoryRepo {

    @PersistenceContext
    EntityManager em;

//    public List<MatchHistoryDataDTO> getHistoryDetails(){
//
//    }
}
