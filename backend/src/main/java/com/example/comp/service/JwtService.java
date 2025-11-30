package com.example.comp.service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;


    @Service
    public class JwtService {

        private static final String SECRET_KEY = "1c5b7c2b8f8f4d48a1b7e5c2a6f8d1e0c8c12e3f0b6a9d4f5b2c8d3e4f6a1b2"; // 64 chars

        private Key getSignInKey() {
            byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
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
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
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
