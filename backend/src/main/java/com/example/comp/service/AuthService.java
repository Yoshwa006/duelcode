package com.example.comp.service;

import com.example.comp.dto.auth.AuthRequest;
import com.example.comp.dto.auth.AuthResponse;
import com.example.comp.dto.Mapper;
import com.example.comp.model.Users;
import com.example.comp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo repo;
    private final JwtService jwtService;

    @Autowired
    public AuthService(UserRepo repo, JwtService jwtService) {
        this.repo = repo;
        this.jwtService = jwtService;
    }

    public boolean isEmailExists(String email) {
        return repo.findByEmail(email) != null;
    }

    public void register(AuthRequest authDTO) {
        if (isEmailExists(authDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Users savingUser = Mapper.DTOtoUser(authDTO);
        repo.save(savingUser);
    }

    public AuthResponse login(AuthRequest request) {
        Users user = repo.findByEmail(request.getEmail());
        AuthResponse response = new AuthResponse();

        if (user == null) {
            response.setValid(false);
            response.setToken(null);
            return response; // email not found
        }

        if (!user.getPassword().equals(request.getPassword())) {
            response.setValid(false);
            response.setToken(null);
            return response; // wrong password
        }

        // success
        String token = jwtService.generateToken(user.getEmail());
        response.setValid(true);
        response.setToken(token);

        return response;
    }

}
