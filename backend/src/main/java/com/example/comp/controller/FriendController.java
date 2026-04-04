package com.example.comp.controller;

import com.example.comp.dto.FriendRequestActionRequest;
import com.example.comp.dto.FriendRequestCreateRequest;
import com.example.comp.dto.FriendRequestResponse;
import com.example.comp.dto.UserProfileDTO;
import com.example.comp.dto.UserSummaryDTO;
import com.example.comp.service.FriendService;
import com.example.comp.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;
    private final UserService userService;

    public FriendController(FriendService friendService, UserService userService) {
        this.friendService = friendService;
        this.userService = userService;
    }

    @PostMapping("/requests")
    public ResponseEntity<FriendRequestResponse> sendRequest(@RequestBody FriendRequestCreateRequest request) {
        int currentUserId = userService.getCurrentUser().getId();
        request.setSenderId(currentUserId);
        return ResponseEntity.ok(friendService.sendRequest(request));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestResponse>> getPendingRequests() {
        int currentUserId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(friendService.getPendingRequests(currentUserId));
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestResponse>> getSentRequests() {
        int currentUserId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(friendService.getSentRequests(currentUserId));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<FriendRequestResponse> acceptRequest(@PathVariable Long requestId) {
        int currentUserId = userService.getCurrentUser().getId();
        FriendRequestActionRequest request = new FriendRequestActionRequest();
        request.setUserId(currentUserId);
        return ResponseEntity.ok(friendService.acceptRequest(requestId, request));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<FriendRequestResponse> rejectRequest(@PathVariable Long requestId) {
        int currentUserId = userService.getCurrentUser().getId();
        FriendRequestActionRequest request = new FriendRequestActionRequest();
        request.setUserId(currentUserId);
        return ResponseEntity.ok(friendService.rejectRequest(requestId, request));
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getFriends() {
        int currentUserId = userService.getCurrentUser().getId();
        return ResponseEntity.ok(friendService.getFriendsWithProfile(currentUserId));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable int friendId) {
        int currentUserId = userService.getCurrentUser().getId();
        friendService.removeFriend(currentUserId, friendId);
        return ResponseEntity.ok().build();
    }
}