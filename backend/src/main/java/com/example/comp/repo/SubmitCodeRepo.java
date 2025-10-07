package com.example.comp.repo;

import com.example.comp.model.SubmitCode;
import com.example.comp.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmitCodeRepo extends JpaRepository<SubmitCode, Long> {
}
