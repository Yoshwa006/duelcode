package com.example.comp.repo;

import com.example.comp.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepo extends JpaRepository<Users, Integer> {
     Users findByEmail(String mail);
     @Query("SELECT u.id FROM Users u WHERE u.email = :email")
     Optional<Integer> findIdByEmail(@Param("email") String email);

}
