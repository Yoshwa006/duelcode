package com.example.comp;

import com.example.comp.service.ScriptService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.Duration;

@SpringBootApplication
public class CompApplication {

    public static void main(String[] args) {

        SpringApplication app = new SpringApplication(CompApplication.class);

        ScriptService starter = new ScriptService(
                "/home/yoshwa/Java/backend-java-comp/backend/src/main/java/com/example/comp/util/start-es.sh",
                9200,
                Duration.ofSeconds(60),
                Duration.ofSeconds(2)
        );

        app.addInitializers(starter);
        app.run(args);
    }

}
