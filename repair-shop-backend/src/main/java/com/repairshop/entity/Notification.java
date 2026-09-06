package com.repairshop.entity;
import com.repairshop.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "notifications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id") private Integer notificationId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(name = "type", nullable = false) private NotificationType type;
    @Column(name = "title", nullable = false, length = 150) private String title;
    @Column(name = "message", nullable = false, columnDefinition = "TEXT") private String message;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_ticket_id") private RepairTicket relatedTicket;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_quote_id") private Quote relatedQuote;
    @Column(name = "is_read") private Boolean isRead;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); if(isRead==null) isRead=false; }
}
