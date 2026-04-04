package com.example.comp.controller;

import com.example.comp.dto.UpdateUserProfileDTO;
import com.example.comp.dto.UserProfileDTO;
import com.example.comp.dto.UserSummaryDTO;
import com.example.comp.model.Users;
import com.example.comp.repo.UserRepo;
import com.example.comp.service.UserService;
import com.example.comp.service.FriendService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepo userRepo;
    private final UserService userService;
    private final FriendService friendService;

    public UserController(UserRepo userRepo, UserService userService, FriendService friendService) {
        this.userRepo = userRepo;
        this.userService = userService;
        this.friendService = friendService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<UserProfileDTO>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String rank,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order) {
        
        int currentUserId = userService.getCurrentUser().getId();
        
        Sort sort = Sort.by(Sort.Direction.fromString(order != null ? order : "desc", "rating"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), sort);
        
        Page<Users> usersPage;
        
        if (search != null && !search.isEmpty()) {
            usersPage = userRepo.findByUsernameContainingIgnoreCase(search, pageable);
        } else if (country != null && !country.isEmpty()) {
            usersPage = userRepo.findByCountryIgnoreCase(country, pageable);
        } else if (rank != null && !rank.isEmpty()) {
            usersPage = userRepo.findByRank(rank, pageable);
        } else {
            usersPage = userRepo.findAll(pageable);
        }
        
        Page<UserProfileDTO> result = usersPage.map(user -> {
            UserProfileDTO dto = userService.mapToDTO(user);
            dto.setFriendCount(friendService.getFriendCount(user.getId()));
            return dto;
        });
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserProfileDTO>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Users> users = userRepo.findTop10ByUsernameContainingIgnoreCase(query);
        int currentUserId = userService.getCurrentUser().getId();
        
        List<UserProfileDTO> result = users.stream()
                .filter(user -> user.getId() != currentUserId)
                .limit(limit)
                .map(user -> {
                    UserProfileDTO dto = userService.mapToDTO(user);
                    dto.setIsFriend(friendService.areFriends(currentUserId, user.getId()));
                    dto.setHasPendingRequest(friendService.hasPendingRequest(currentUserId, user.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile() {
        UserProfileDTO profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable int userId) {
        int currentUserId = userService.getCurrentUser().getId();
        UserProfileDTO profile = userService.getUserProfileById(userId);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        profile.setIsFriend(friendService.areFriends(currentUserId, userId));
        profile.setHasPendingRequest(friendService.hasPendingRequest(currentUserId, userId));
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDTO> updateProfile(@RequestBody UpdateUserProfileDTO updateDTO) {
        UserProfileDTO profile = userService.updateProfile(updateDTO);
        return ResponseEntity.ok(profile);
    }
}