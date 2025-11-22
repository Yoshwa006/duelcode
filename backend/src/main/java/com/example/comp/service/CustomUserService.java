package com.example.comp.service;

import com.example.comp.model.Users;
import com.example.comp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserService implements UserDetailsService {

    private final UserRepo repo;

    @Autowired
    public CustomUserService(UserRepo repo){
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users users = repo.findByEmail(email);

        if (users == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        return users;
    }
}
