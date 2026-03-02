package com.example.comp.controller;

import com.example.comp.dto.FriendRequestActionRequest;
import com.example.comp.dto.FriendRequestCreateRequest;
import com.example.comp.dto.FriendRequestResponse;
import com.example.comp.dto.UserSummaryDTO;
import com.example.comp.service.FriendService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @PostMapping("/requests")
    public FriendRequestResponse sendRequest(@RequestBody FriendRequestCreateRequest request) {
        return friendService.sendRequest(request);
    }

    @GetMapping("/requests")
    public List<FriendRequestResponse> getPendingRequests(@RequestParam int userId) {
        return friendService.getPendingRequests(userId);
    }

    @PostMapping("/requests/{requestId}/accept")
    public FriendRequestResponse acceptRequest(@PathVariable Long requestId,
                                               @RequestBody FriendRequestActionRequest request) {
        return friendService.acceptRequest(requestId, request);
    }

    @PostMapping("/requests/{requestId}/reject")
    public FriendRequestResponse rejectRequest(@PathVariable Long requestId,
                                               @RequestBody FriendRequestActionRequest request) {
        return friendService.rejectRequest(requestId, request);
    }

    @GetMapping
    public List<UserSummaryDTO> getFriends(@RequestParam int userId) {
        return friendService.getFriends(userId);
    }
}
