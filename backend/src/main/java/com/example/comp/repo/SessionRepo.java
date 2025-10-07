package com.example.comp.repo;

import com.example.comp.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepo extends JpaRepository<Session, Integer> {


    @Query("SELECT s.joinedBy FROM Session s WHERE s.token = :token")
    Integer findJoinedByByToken(@Param("token") String token);

    Optional<Session> findById(Integer id);

    Session findByToken(String token);
    @Query("SELECT s FROM Session s WHERE s.createdBy = :userId OR s.joinedBy = :userId")
    Session findByUserId(@Param("userId") Long userId);

    boolean existsByToken(String token);

}
