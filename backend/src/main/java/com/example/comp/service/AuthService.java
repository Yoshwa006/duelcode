package com.example.comp.service;

import com.example.comp.model.PasswordResetToken;
import com.example.comp.dto.auth.AuthRequest;
import com.example.comp.dto.auth.AuthResponse;
import com.example.comp.mapper.Mapper;
import com.example.comp.model.UserProfile;
import com.example.comp.model.UserStats;
import com.example.comp.model.Users;
import com.example.comp.repo.PasswordTokenResetRepo;
import com.example.comp.repo.UserRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordTokenResetRepo passwordTokenResetRepo;

    @Autowired
    public AuthService(UserRepo repo, JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       PasswordTokenResetRepo passwordTokenResetRepo) {
        this.userRepo = repo;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.passwordTokenResetRepo = passwordTokenResetRepo;
    }

    public boolean isEmailExists(String email) {
        return userRepo.findByEmail(email) != null;
    }

    @Transactional
    public void register(AuthRequest authDTO) {
        if (isEmailExists(authDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Users savingUser = Mapper.DTOtoUser(authDTO);
        savingUser.setPassword(passwordEncoder.encode(authDTO.getPassword()));
        
        String username = authDTO.getEmail().split("@")[0];
        savingUser.setUsername(username);
        savingUser.setRegistrationTime(System.currentTimeMillis());
        savingUser.setLastOnlineTime(System.currentTimeMillis());
        
        userRepo.save(savingUser);
        
        log.info("User registered successfully: {}", savingUser.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        Users user = userRepo.findByEmail(request.getEmail());
        AuthResponse response = new AuthResponse();

        if (user == null) {
            response.setValid(false);
            response.setToken(null);
            return response; 
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setValid(false);
            response.setToken(null);
            return response; 
        }

        user.setLastOnlineTime(System.currentTimeMillis());
        userRepo.save(user);

        String token = jwtService.generateToken(user.getEmail());
        response.setValid(true);
        response.setToken(token);

        return response;
    }

    public String forgetPassword(String mail){
        Users users = userRepo.findByEmail(mail);
        if(users == null){
            log.warn("Password reset requested for non-existent email: {}", mail);
            return "failed !";
        }
        String token = UUID.randomUUID().toString();

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUsed(false);
        passwordResetToken.setUser(users);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        passwordTokenResetRepo.save(passwordResetToken);

        emailService.sendMail(
                users.getEmail(),
                "Password Reset Request",
                "Your password reset token is: " + token
        );
        log.info("Password reset token generated for user: {}", users.getEmail());
        return token;
    }

    public boolean resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = passwordTokenResetRepo.findByToken(token);
        if(resetToken == null){
            log.warn("Password reset attempted with invalid token");
            return false;
        }

        if (resetToken.isUsed() ||
                resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Password reset attempted with expired or used token");
            return false;
        }

        Users user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        passwordTokenResetRepo.save(resetToken);
        log.info("Password successfully reset for user: {}", user.getEmail());
        return true;
    }
}