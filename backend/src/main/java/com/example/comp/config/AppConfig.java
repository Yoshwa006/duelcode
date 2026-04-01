package com.example.comp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {

    private Cors cors = new Cors();
    private Jwt jwt = new Jwt();
    private Redis redis = new Redis();
    private Mail mail = new Mail();
    private Judge judge = new Judge();

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");
    }

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expiration = 86400000;
    }

    @Getter
    @Setter
    public static class Redis {
        private String host = "localhost";
        private int port = 6379;
    }

    @Getter
    @Setter
    public static class Mail {
        private String host = "smtp.gmail.com";
        private int port = 587;
        private String username;
        private String password;
    }

    @Getter
    @Setter
    public static class Judge {
        private String apiUrl = "http://localhost:3001";
    }
}
