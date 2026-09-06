package com.repairshop.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "ticket_status_history")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id") private Integer historyId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false) private RepairTicket ticket;
    @Column(name = "status", nullable = false, length = 30) private String status;
    @Column(name = "note", columnDefinition = "TEXT") private String note;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by") private User changedBy;
    @Column(name = "changed_at") private LocalDateTime changedAt;
    @PrePersist void onCreate() { changedAt = LocalDateTime.now(); }
}
