package com.example.comp.repo;
import com.example.comp.model.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStatsRepo extends JpaRepository<UserStats, UUID> {
    Optional<UserStats> findByUserId(int userId);
    List<UserStats> findTop100ByOrderByEloRatingDesc();
}
