package com.example.comp.service;

import com.example.comp.model.PasswordResetToken;
import com.example.comp.dto.auth.AuthRequest;
import com.example.comp.dto.auth.AuthResponse;
import com.example.comp.mapper.Mapper;
import com.example.comp.model.Users;
import com.example.comp.repo.PasswordTokenResetRepo;
import com.example.comp.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

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

    public void register(AuthRequest authDTO) {
        if (isEmailExists(authDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        Users savingUser = Mapper.DTOtoUser(authDTO);
        // Hash password before saving
        savingUser.setPassword(passwordEncoder.encode(authDTO.getPassword()));
        userRepo.save(savingUser);
    }

    public AuthResponse login(AuthRequest request) {
        Users user = userRepo.findByEmail(request.getEmail());
        AuthResponse response = new AuthResponse();

        if (user == null) {
            response.setValid(false);
            response.setToken(null);
            return response; // email not found
        }

        // Use password encoder to compare hashed password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setValid(false);
            response.setToken(null);
            return response; // wrong password
        }

        String token = jwtService.generateToken(user.getEmail());
        response.setValid(true);
        response.setToken(token);

        return response;
    }

    public String forgetPassword(String mail){
        Users users = userRepo.findByEmail(mail);
        if(users == null){
            System.out.println("Invalid email !");
            return "failed !";
        }
        String token = UUID.randomUUID().toString();

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setId(UUID.randomUUID());
        passwordResetToken.setToken(token);
        passwordResetToken.setUsed(false);
        passwordResetToken.setUser(users);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        passwordTokenResetRepo.save(passwordResetToken);
        String url = "http://localhost:8080/auth/reset-password?token=" +  token;
        emailService.sendMail(
                users.getEmail(),
                "Forget password reset link",
                "http://localhost:8080/auth/reset-password?token=" + token
        );
        return url;
    }

    public boolean resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = passwordTokenResetRepo.findByToken(token);
        if(resetToken == null){
            System.out.println("Token is invalid or expired !");
            return false;
        }

        if (resetToken.isUsed() ||
                resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        Users user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        passwordTokenResetRepo.save(resetToken);
        return true;
    }
}
