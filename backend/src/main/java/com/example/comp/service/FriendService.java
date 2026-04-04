package com.example.comp.service;

import com.example.comp.dto.FriendRequestActionRequest;
import com.example.comp.dto.FriendRequestCreateRequest;
import com.example.comp.dto.FriendRequestResponse;
import com.example.comp.dto.UserProfileDTO;
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

    public List<FriendRequestResponse> getSentRequests(int userId) {
        List<FriendRequest> requests = friendRequestRepo.findBySenderIdAndStatus(userId, FriendRequestStatus.PENDING);
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

    public List<UserProfileDTO> getFriendsWithProfile(int userId) {
        List<FriendRequest> accepted = friendRequestRepo.findByStatusForUser(userId, FriendRequestStatus.ACCEPTED);
        return accepted.stream()
                .map(friendRequest -> {
                    Users friend = friendRequest.getSender().getId() == userId
                            ? friendRequest.getReceiver()
                            : friendRequest.getSender();
                    return mapToProfileDTO(friend);
                })
                .toList();
    }

    public void removeFriend(int userId, int friendId) {
        List<FriendRequest> accepted = friendRequestRepo.findByStatusForUser(userId, FriendRequestStatus.ACCEPTED);
        for (FriendRequest fr : accepted) {
            boolean isParticipant = (fr.getSender().getId() == userId && fr.getReceiver().getId() == friendId) ||
                    (fr.getSender().getId() == friendId && fr.getReceiver().getId() == userId);
            if (isParticipant) {
                friendRequestRepo.delete(fr);
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend not found.");
    }

    public boolean areFriends(int userId1, int userId2) {
        List<FriendRequest> accepted = friendRequestRepo.findByStatusForUser(userId1, FriendRequestStatus.ACCEPTED);
        for (FriendRequest fr : accepted) {
            if ((fr.getSender().getId() == userId1 && fr.getReceiver().getId() == userId2) ||
                    (fr.getSender().getId() == userId2 && fr.getReceiver().getId() == userId1)) {
                return true;
            }
        }
        return false;
    }

    public boolean hasPendingRequest(int fromUserId, int toUserId) {
        List<FriendRequest> requests = friendRequestRepo.findBetweenUsers(fromUserId, toUserId);
        for (FriendRequest fr : requests) {
            if (fr.getStatus() == FriendRequestStatus.PENDING) {
                return true;
            }
        }
        return false;
    }

    public int getFriendCount(int userId) {
        List<FriendRequest> accepted = friendRequestRepo.findByStatusForUser(userId, FriendRequestStatus.ACCEPTED);
        return accepted.size();
    }

    private UserProfileDTO mapToProfileDTO(Users user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setCountry(user.getCountry());
        dto.setCity(user.getCity());
        dto.setOrganization(user.getOrganization());
        dto.setRating(user.getRating());
        dto.setMaxRating(user.getMaxRating());
        dto.setRank(user.getRank());
        dto.setMaxRank(user.getMaxRank());
        return dto;
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