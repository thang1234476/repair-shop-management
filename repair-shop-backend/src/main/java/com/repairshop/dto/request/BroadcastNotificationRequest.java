package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class BroadcastNotificationRequest {
    @NotBlank private String title;
    @NotBlank private String message;
    private List<Integer> targetUserIds; // null = broadcast to all customers
}
