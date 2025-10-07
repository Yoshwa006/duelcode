package com.example.comp.service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;


    @Service
    public class JwtService {

        private final Key key = Keys.hmacShaKeyFor("ab8c6eb9ec7fbcdacc93ac24104fb687c7dc3fdec8562aee8b2c8495f7aeaba5c7622c8c6d5f2b469bde1a01f70f1b7572e98e42011eb6c6ba2b981e595a897960ca3bad91e981c94359b9bf59598c946dda5a642ca5b24f06c98e203c815448794e2c7d3e12b9cf41dbddff875002f268850757a605c05355b664a278b9028df96187729ea4c099da6859a0b31d5aaf570b83b7bfbcc4f89ed8f760a5160660e7c029dfaa67362ad664bc63d863426420277a771a6a9597fd3a0821afb427c9981112e07c587b9fa602b3981bfdba046e8ec5c33ef3d1964dd1302813d5ea4e4c11360a2741c7977813bce3a9ed13685646fe3165631fb22e8b9f45f1395230".getBytes());

        public String generateToken(String email) {
            return Jwts.builder()
                    .setSubject(email)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 365 * 100)) // 100 years
                    .signWith(key)
                    .compact();
        }

        public String extractUsername(String token) {
            return extractClaim(token, Claims::getSubject);
        }

        public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
            final Claims claims = extractAllClaims(token);
            return claimsResolver.apply(claims);
        }

        public boolean isTokenValid(String token, UserDetails userDetails) {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        }

        private boolean isTokenExpired(String token) {
            return extractExpiration(token).before(new Date());
        }

        private Date extractExpiration(String token) {
            return extractClaim(token, Claims::getExpiration);
        }

        private Claims extractAllClaims(String token) {
            return Jwts.parserBuilder()
                    .setSigningKey(key) // `key` should be of type SecretKey or byte[]
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }

        public static void main(String[] args) {
            JwtService service = new JwtService();
            String tok = service.generateToken("kavin@gmail.com");
            System.out.println("Generated Token: " + tok);
            System.out.println("Extracted Username: " + service.extractUsername(tok));
            System.out.println("Is Token Expired: " + service.isTokenExpired(tok));
            Claims claims = service.extractAllClaims(tok);
            System.out.println("Claims: " + claims);
            System.out.println();
            System.out.println(service.isTokenExpired("eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0MiIsImlhdCI6MTc1Mjg1NDI1MCwiZXhwIjo0OTA2NDU0MjUwfQ.JXhDmmkFhVnuWrPdZ3uT7URkp-SBT6GRzGyn_CYZcFJDoDvA19Rpyufggbk9Y2_xs_Hc5i_g6PwT1tIQ_ni4jg"));
        }
    }

