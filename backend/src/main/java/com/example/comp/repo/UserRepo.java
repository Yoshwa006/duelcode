package com.example.comp.repo;

import com.example.comp.model.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users, Integer> {
     Users findByEmail(String mail);
     
     @Query("SELECT u.id FROM Users u WHERE u.email = :email")
     Optional<Integer> findIdByEmail(@Param("email") String email);

     Page<Users> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
     
     Page<Users> findByCountryIgnoreCase(String country, Pageable pageable);
     
     Page<Users> findByRank(String rank, Pageable pageable);
     
     List<Users> findTop10ByUsernameContainingIgnoreCase(String username);
     
     @Query("SELECT COUNT(f) FROM FriendRequest f WHERE (f.sender.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
     int getFriendCount(@Param("userId") int userId);
}