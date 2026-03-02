package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendRequestCreateRequest {
    private int senderId;
    private int receiverId;
}
