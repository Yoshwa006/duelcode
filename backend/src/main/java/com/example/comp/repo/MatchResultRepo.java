package com.example.comp.repo;

import com.example.comp.model.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MatchResultRepo extends JpaRepository<MatchResult, UUID> {
}
