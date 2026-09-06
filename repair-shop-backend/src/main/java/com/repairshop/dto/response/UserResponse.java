package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Integer userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
