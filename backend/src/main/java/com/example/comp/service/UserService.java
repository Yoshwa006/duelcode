package com.example.comp.service;

import com.example.comp.dto.UpdateUserProfileDTO;
import com.example.comp.dto.UserProfileDTO;
import com.example.comp.model.Users;
import com.example.comp.repo.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserService {

    private final UserRepo userRepo;

    @Autowired
    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public Users getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email);
    }

    public UserProfileDTO getCurrentUserProfile() {
        Users user = getCurrentUser();
        return mapToDTO(user);
    }

    public UserProfileDTO getUserProfileById(int userId) {
        Users user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        return mapToDTO(user);
    }

    public UserProfileDTO updateProfile(UpdateUserProfileDTO updateDTO) {
        Users user = getCurrentUser();

        if (updateDTO.getUsername() != null) {
            user.setUsername(updateDTO.getUsername());
        }
        if (updateDTO.getCountry() != null) {
            user.setCountry(updateDTO.getCountry());
        }
        if (updateDTO.getCity() != null) {
            user.setCity(updateDTO.getCity());
        }
        if (updateDTO.getOrganization() != null) {
            user.setOrganization(updateDTO.getOrganization());
        }
        if (updateDTO.getAvatarUrl() != null) {
            user.setAvatarUrl(updateDTO.getAvatarUrl());
        }
        if (updateDTO.getWebsite() != null) {
            user.setWebsite(updateDTO.getWebsite());
        }
        if (updateDTO.getTwitter() != null) {
            user.setTwitter(updateDTO.getTwitter());
        }
        if (updateDTO.getGithub() != null) {
            user.setGithub(updateDTO.getGithub());
        }
        if (updateDTO.getLinkedin() != null) {
            user.setLinkedin(updateDTO.getLinkedin());
        }
        if (updateDTO.getBio() != null) {
            user.setBio(updateDTO.getBio());
        }

        userRepo.save(user);
        log.info("User profile updated: {}", user.getEmail());

        return mapToDTO(user);
    }

    private UserProfileDTO mapToDTO(Users user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setCountry(user.getCountry());
        dto.setCity(user.getCity());
        dto.setOrganization(user.getOrganization());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setWebsite(user.getWebsite());
        dto.setTwitter(user.getTwitter());
        dto.setGithub(user.getGithub());
        dto.setLinkedin(user.getLinkedin());
        dto.setBio(user.getBio());
        dto.setRating(user.getRating());
        dto.setMaxRating(user.getMaxRating());
        dto.setRank(user.getRank());
        dto.setMaxRank(user.getMaxRank());
        dto.setContribution(user.getContribution());
        dto.setRegistrationTime(user.getRegistrationTime());
        dto.setLastOnlineTime(user.getLastOnlineTime());
        dto.setProblemCount(user.getProblemCount());
        dto.setContestCount(user.getContestCount());
        dto.setSolvedCount(user.getSolvedCount());
        dto.setSubmissionCount(user.getSubmissionCount());

        if (user.getStats() != null) {
            dto.setEloRating(user.getStats().getEloRating());
            dto.setRankedWins(user.getStats().getRankedWins());
            dto.setRankedLosses(user.getStats().getRankedLosses());
            dto.setTotalScore(user.getStats().getTotalScore());
            dto.setQuestionsSolved(user.getStats().getQuestionsSolved());
            dto.setTotalSolveTime(user.getStats().getTotalSolveTime());
            dto.setEasySolved(user.getStats().getEasySolved());
            dto.setMediumSolved(user.getStats().getMediumSolved());
            dto.setHardSolved(user.getStats().getHardSolved());
            dto.setTotalContests(user.getStats().getTotalContests());
            dto.setContestsWon(user.getStats().getContestsWon());
        } else {
            dto.setEloRating(user.getRating());
            dto.setRankedWins(0);
            dto.setRankedLosses(0);
            dto.setTotalScore(0L);
            dto.setQuestionsSolved(0);
            dto.setTotalSolveTime(0L);
            dto.setEasySolved(0);
            dto.setMediumSolved(0);
            dto.setHardSolved(0);
            dto.setTotalContests(0);
            dto.setContestsWon(0);
        }

        return dto;
    }

    public UserProfileDTO mapToDTO(Users user) {
        return mapToDTO(user);
    }
}