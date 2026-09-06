package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Integer notificationId;
    private String type;
    private String title;
    private String message;
    private Integer relatedTicketId;
    private Integer relatedQuoteId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
