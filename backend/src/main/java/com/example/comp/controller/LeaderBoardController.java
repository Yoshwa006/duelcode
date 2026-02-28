package com.example.comp.controller;

import com.example.comp.model.UserStats;
import com.example.comp.repo.UserStatsRepo;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class LeaderBoardController {

    private final UserStatsRepo userStatsRepo;

    @GetMapping("/leaderboard")
    public List<UserStats> leaderboard() {
        return userStatsRepo.findTop100ByOrderByEloRatingDesc();
    }

}
