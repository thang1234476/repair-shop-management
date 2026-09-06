package com.repairshop.entity;
import com.repairshop.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "repair_tickets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RepairTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id") private Integer ticketId;
    @Column(name = "ticket_code", nullable = false, unique = true, length = 30) private String ticketCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false) private Device device;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id") private Staff staff;
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) private TicketStatus status;
    @Column(name = "issue_description", columnDefinition = "TEXT") private String issueDescription;
    @Column(name = "diagnosis_notes", columnDefinition = "TEXT") private String diagnosisNotes;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL) private List<TicketStatusHistory> statusHistory;
    @OneToMany(mappedBy = "ticket") private List<Quote> quotes;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); if(status==null) status=TicketStatus.RECEIVED; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
