package com.example.comp.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;

public class ScriptService implements ApplicationContextInitializer<ConfigurableApplicationContext> {


    private final String scriptPath;
    private final int port;
    private final Duration timeout;
    private final Duration pollInterval;

    public ScriptService(String scriptPath, int port, Duration timeout, Duration pollInterval) {
        this.scriptPath = scriptPath;
        this.port = port;
        this.timeout = timeout;
        this.pollInterval = pollInterval;
    }


    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            ProcessBuilder pb = new ProcessBuilder("/bin/bash", scriptPath);
            pb.inheritIO();
            Process p = pb.start();
            Thread.sleep(1000);
            waitForElasticsearch();
        } catch (Exception e) {
            throw new RuntimeException("Failed to start Elasticsearch via script", e);
        }
    }
    private void waitForElasticsearch() throws InterruptedException {
        Instant start = Instant.now();
        while (Duration.between(start, Instant.now()).compareTo(timeout) < 0) {
            if (isElasticsearchUp()) {
                System.out.println("Elasticsearch is up!");
                return;
            }
            Thread.sleep(pollInterval.toMillis());
        }
        throw new RuntimeException("Timed out waiting for Elasticsearch to become available on port " + port);
    }

    private boolean isElasticsearchUp() {
        String urlStr = "http://localhost:" + port + "/";
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);
            conn.setRequestMethod("GET");
            int code = conn.getResponseCode();
            return code >= 200 && code < 500; // ES usually returns 200 or 401/403 when security enabled
        } catch (IOException e) {
            return false;
        }
    }


}
