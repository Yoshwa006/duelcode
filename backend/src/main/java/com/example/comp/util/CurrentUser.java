package com.example.comp.util;

import com.example.comp.model.Users;
import com.example.comp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    private final UserRepo userRepo;

    @Autowired
    public CurrentUser(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public Users get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        String email =
                principal instanceof UserDetails ? ((UserDetails) principal).getUsername() :
                        principal instanceof String ? (String) principal :
                                null;

        return email == null ? null : userRepo.findByEmail(email);
    }
}
