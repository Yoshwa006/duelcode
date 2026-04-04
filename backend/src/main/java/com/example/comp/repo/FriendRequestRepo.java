package com.example.comp.repo;

import com.example.comp.enums.FriendRequestStatus;
import com.example.comp.model.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRequestRepo extends JpaRepository<FriendRequest, Long> {

    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender.id = :userA AND fr.receiver.id = :userB) " +
            "OR (fr.sender.id = :userB AND fr.receiver.id = :userA)")
    List<FriendRequest> findBetweenUsers(@Param("userA") int userA, @Param("userB") int userB);

    List<FriendRequest> findByReceiverIdAndStatus(int receiverId, FriendRequestStatus status);

    @Query("SELECT fr FROM FriendRequest fr WHERE fr.status = :status AND (fr.sender.id = :userId OR fr.receiver.id = :userId)")
    List<FriendRequest> findByStatusForUser(@Param("userId") int userId, @Param("status") FriendRequestStatus status);

    List<FriendRequest> findBySenderIdAndStatus(int senderId, FriendRequestStatus status);
}
