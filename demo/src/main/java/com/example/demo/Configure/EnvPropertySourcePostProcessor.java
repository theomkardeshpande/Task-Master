package com.example.demo.Configure;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class EnvPropertySourcePostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // Try multiple locations for .env file
        String[] possiblePaths = {
                ".env",                                    // Current working directory
                "demo/.env",                              // From parent directory
                "../.env",                                // Parent directory
                "../../.env"                              // Two levels up
        };

        Path envFilePath = null;
        for (String path : possiblePaths) {
            Path checkPath = Paths.get(path).toAbsolutePath();
            if (Files.exists(checkPath)) {
                envFilePath = checkPath;
                break;
            }
        }

        if (envFilePath != null) {
            try {
                System.out.println("Loading .env file from: " + envFilePath);
                
                // Load .env file using dotenv-java
                Dotenv dotenv = Dotenv.configure()
                        .directory(envFilePath.getParent().toString())
                        .filename(envFilePath.getFileName().toString())
                        .load();

                // Convert dotenv values to a map
                Map<String, Object> envMap = new HashMap<>();
                dotenv.entries().forEach(entry -> 
                    envMap.put(entry.getKey(), entry.getValue())
                );

                // Add as a property source to Spring environment
                MapPropertySource propertySource = new MapPropertySource("dotenv", envMap);
                environment.getPropertySources().addLast(propertySource);
                
                System.out.println("Successfully loaded " + envMap.size() + " properties from .env file");

            } catch (Exception e) {
                System.err.println("Error loading .env file: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("Warning: .env file not found in any of the expected locations");
            System.err.println("Searched in: " + String.join(", ", possiblePaths));
        }
    }
}
