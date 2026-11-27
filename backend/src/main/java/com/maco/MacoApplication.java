package com.maco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MacoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MacoApplication.class, args);
    }
}
