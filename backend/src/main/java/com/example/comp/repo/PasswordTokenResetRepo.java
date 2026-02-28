package com.example.comp.repo;

import com.example.comp.model.PasswordResetToken;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PasswordTokenResetRepo extends JpaRepository<PasswordResetToken, UUID> {
    PasswordResetToken findByToken(String token);
}
