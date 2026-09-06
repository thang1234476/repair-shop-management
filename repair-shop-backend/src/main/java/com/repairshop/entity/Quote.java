package com.repairshop.entity;
import com.repairshop.enums.QuoteStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "quotes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Quote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quote_id") private Integer quoteId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false) private RepairTicket ticket;
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2) private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) private QuoteStatus status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false) private Staff createdBy;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "responded_at") private LocalDateTime respondedAt;
    @Column(name = "customer_note", columnDefinition = "TEXT") private String customerNote;
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true) private List<QuoteItem> items;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); if(status==null) status=QuoteStatus.PENDING; }
}
