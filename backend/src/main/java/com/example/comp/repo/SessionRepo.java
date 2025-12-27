package com.example.comp.repo;

import com.example.comp.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SessionRepo extends JpaRepository<Session, UUID> {


    @Query("SELECT s.joinedBy FROM Session s WHERE s.token = :token")
    Integer findJoinedByByToken(@Param("token") String token);
    Session findByToken(String token);
    @Query("SELECT s FROM Session s WHERE s.createdBy.id = :userId OR s.joinedBy.id = :userId")
    Session findByUserId(@Param("userId") Integer userId);

    boolean existsByToken(String token);

    Session findTopByJoinedByIsNullOrderByCreatedAtDesc();

    @Query("""
    SELECT s
    FROM Session s
    WHERE s.createdBy.id = :userId
       OR s.joinedBy.id = :userId
       and s.status = 'STATUS_PLAYING'
    ORDER BY s.createdAt DESC
    limit 1
""")
    Session findSessionsForUser(@Param("userId") int userId);

}
