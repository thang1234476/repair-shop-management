package com.repairshop.entity;
import com.repairshop.enums.InventoryTransactionType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "inventory_transactions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InventoryTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id") private Integer transactionId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false) private Part part;
    @Enumerated(EnumType.STRING) @Column(name = "type", nullable = false) private InventoryTransactionType type;
    @Column(name = "quantity", nullable = false) private Integer quantity;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_ticket_id") private RepairTicket relatedTicket;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false) private User performedBy;
    @Column(name = "transaction_date") private LocalDateTime transactionDate;
    @Column(name = "note", columnDefinition = "TEXT") private String note;
    @PrePersist void onCreate() { transactionDate = LocalDateTime.now(); }
}
