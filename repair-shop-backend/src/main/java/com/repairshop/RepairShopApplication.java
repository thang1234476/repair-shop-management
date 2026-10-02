package com.repairshop;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class RepairShopApplication {
    public static void main(String[] args) {
        // Tự động nạp các biến từ file .env nếu có (ưu tiên thư mục hiện tại, rồi đến thư mục gốc dự án)
        String envDir = "./";
        if (!new File(".env").exists() && new File("../.env").exists()) {
            envDir = "../";
        }

        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(envDir)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception ignored) {
        }

        SpringApplication.run(RepairShopApplication.class, args);
    }
}
