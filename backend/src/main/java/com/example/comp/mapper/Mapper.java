package com.example.comp.mapper;

import com.example.comp.dto.SubmitAPI;
import com.example.comp.dto.SubmitRequest;
import com.example.comp.dto.auth.AuthRequest;
import com.example.comp.model.TestCases;
import com.example.comp.model.Users;

public class Mapper {

    public static Users DTOtoUser(AuthRequest authDTO) {
        Users user = new Users();
        user.setEmail(authDTO.getEmail());
        user.setPassword(authDTO.getPassword());
        return user;
    }

    public static AuthRequest UsertoDTO(Users user) {
        AuthRequest authDTO = new AuthRequest();
        authDTO.setEmail(user.getEmail());
        authDTO.setPassword(user.getPassword());
        return authDTO;
    }

    public static SubmitAPI SubmitRequestToAPI(SubmitRequest request) {
        SubmitAPI submitAPI = new SubmitAPI();
        submitAPI.setSource_code(request.getSource_code());
        submitAPI.setLanguage_id(request.getLanguage_id());
//        submitAPI.setStdin(request.getQuestion().getStdIn());
        return submitAPI;
    }
}

