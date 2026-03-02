package com.example.comp.service;

import com.example.comp.dto.FriendRequestActionRequest;
import com.example.comp.dto.FriendRequestCreateRequest;
import com.example.comp.dto.FriendRequestResponse;
import com.example.comp.dto.UserSummaryDTO;
import com.example.comp.enums.FriendRequestStatus;
import com.example.comp.model.FriendRequest;
import com.example.comp.model.Users;
import com.example.comp.repo.FriendRequestRepo;
import com.example.comp.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class FriendService {

    private final FriendRequestRepo friendRequestRepo;
    private final UserRepo userRepo;

    public FriendService(FriendRequestRepo friendRequestRepo, UserRepo userRepo) {
        this.friendRequestRepo = friendRequestRepo;
        this.userRepo = userRepo;
    }

    public FriendRequestResponse sendRequest(FriendRequestCreateRequest request) {
        if (request.getSenderId() == request.getReceiverId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send friend request to yourself.");
        }
        Users sender = userRepo.findById(request.getSenderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found."));
        Users receiver = userRepo.findById(request.getReceiverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found."));

        List<FriendRequest> existing = friendRequestRepo.findBetweenUsers(sender.getId(), receiver.getId());
        for (FriendRequest friendRequest : existing) {
            if (friendRequest.getStatus() == FriendRequestStatus.ACCEPTED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Users are already friends.");
            }
            if (friendRequest.getStatus() == FriendRequestStatus.PENDING) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending request already exists.");
            }
        }

        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(sender);
        friendRequest.setReceiver(receiver);
        friendRequest.setStatus(FriendRequestStatus.PENDING);
        friendRequest.setCreatedAt(Instant.now());
        FriendRequest saved = friendRequestRepo.save(friendRequest);

        return toResponse(saved);
    }

    public List<FriendRequestResponse> getPendingRequests(int userId) {
        List<FriendRequest> requests = friendRequestRepo.findByReceiverIdAndStatus(userId, FriendRequestStatus.PENDING);
        return requests.stream().map(this::toResponse).toList();
    }

    public FriendRequestResponse acceptRequest(Long requestId, FriendRequestActionRequest request) {
        FriendRequest friendRequest = friendRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
        if (friendRequest.getReceiver() == null || friendRequest.getReceiver().getId() != request.getUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the receiver can accept this request.");
        }
        friendRequest.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequest.setRespondedAt(Instant.now());
        FriendRequest saved = friendRequestRepo.save(friendRequest);
        return toResponse(saved);
    }

    public FriendRequestResponse rejectRequest(Long requestId, FriendRequestActionRequest request) {
        FriendRequest friendRequest = friendRequestRepo.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
        if (friendRequest.getReceiver() == null || friendRequest.getReceiver().getId() != request.getUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the receiver can reject this request.");
        }
        friendRequest.setStatus(FriendRequestStatus.REJECTED);
        friendRequest.setRespondedAt(Instant.now());
        FriendRequest saved = friendRequestRepo.save(friendRequest);
        return toResponse(saved);
    }

    public List<UserSummaryDTO> getFriends(int userId) {
        List<FriendRequest> accepted = friendRequestRepo.findByStatusForUser(userId, FriendRequestStatus.ACCEPTED);
        return accepted.stream()
                .map(friendRequest -> {
                    Users friend = friendRequest.getSender().getId() == userId
                            ? friendRequest.getReceiver()
                            : friendRequest.getSender();
                    return new UserSummaryDTO(friend.getId(), friend.getEmail());
                })
                .toList();
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        UserSummaryDTO sender = new UserSummaryDTO(request.getSender().getId(), request.getSender().getEmail());
        UserSummaryDTO receiver = new UserSummaryDTO(request.getReceiver().getId(), request.getReceiver().getEmail());
        return new FriendRequestResponse(
                request.getId(),
                sender,
                receiver,
                request.getStatus(),
                request.getCreatedAt() != null ? request.getCreatedAt().toString() : null,
                request.getRespondedAt() != null ? request.getRespondedAt().toString() : null
        );
    }
}
