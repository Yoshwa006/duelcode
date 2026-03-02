package com.example.comp.controller;

import com.example.comp.dto.UserSummaryDTO;
import com.example.comp.repo.UserRepo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<UserSummaryDTO> listUsers() {
        return userRepo.findAll()
                .stream()
                .map(user -> new UserSummaryDTO(user.getId(), user.getEmail()))
                .toList();
    }
}
