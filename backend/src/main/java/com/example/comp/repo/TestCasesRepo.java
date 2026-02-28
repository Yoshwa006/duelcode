package com.example.comp.repo;

import com.example.comp.model.TestCases;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestCasesRepo extends JpaRepository<TestCases, UUID> {
    List<TestCases> findByQuestionId(UUID questionId);
}
