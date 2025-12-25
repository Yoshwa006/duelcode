package com.example.comp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.time.Duration;

@EnableCaching
@SpringBootApplication
public class CompApplication {


    public static void main(String[] args) {
        SpringApplication.run(CompApplication.class, args);

    }

}
