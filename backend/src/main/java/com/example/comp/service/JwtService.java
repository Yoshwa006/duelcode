package com.example.comp.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import jakarta.annotation.PostConstruct;


    @Service
    public class JwtService {

        @Value("${jwt.secret}")
        private String secretKey;

        @Value("${jwt.expiration:86400000}")
        private long jwtExpiration;

        @PostConstruct
        public void validateSecretKey() {
            if (secretKey == null || secretKey.isBlank()) {
                throw new IllegalStateException("JWT secret must be configured via jwt.secret property");
            }
            try {
                byte[] keyBytes = Decoders.BASE64.decode(secretKey);
                if (keyBytes.length < 32) {
                    throw new IllegalStateException("JWT secret must be at least 256 bits (32 bytes) when Base64-decoded");
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException("JWT secret must be a valid Base64-encoded string");
            }
        }

        private Key getSignInKey() {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            return Keys.hmacShaKeyFor(keyBytes);
        }

        public String extractUsername(String token) {
            return extractClaim(token, Claims::getSubject);
        }

        public <T> T extractClaim(String token, Function<Claims, T> resolver) {
            final Claims claims = extractAllClaims(token);
            return resolver.apply(claims);
        }

        private Claims extractAllClaims(String token) {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }

        public String generateToken(String email) {
            return Jwts.builder()
                    .setSubject(email)                     // REQUIRED
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                    .compact();
        }

        public boolean isTokenValid(String token, UserDetails userDetails) {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        }

        private boolean isTokenExpired(String token) {
            return extractExpiration(token).before(new Date());
        }

        private Date extractExpiration(String token) {
            return extractClaim(token, Claims::getExpiration);
        }
    }
