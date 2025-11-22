package com.example.comp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OperationStatusResponse {
    private String status;
    private String message;
    private int errorCode;
}
