package com.example.comp.dto;

import com.example.comp.enums.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private Long id;
    private UserSummaryDTO sender;
    private UserSummaryDTO receiver;
    private FriendRequestStatus status;
    private String createdAt;
    private String respondedAt;
}
