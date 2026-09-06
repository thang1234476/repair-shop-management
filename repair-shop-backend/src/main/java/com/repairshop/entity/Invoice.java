package com.repairshop.entity;
import com.repairshop.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "invoices")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id") private Integer invoiceId;
    @Column(name = "invoice_code", nullable = false, unique = true, length = 30) private String invoiceCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false) private RepairTicket ticket;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2) private BigDecimal subtotal;
    @Column(name = "tax", precision = 12, scale = 2) private BigDecimal tax;
    @Column(name = "discount", precision = 12, scale = 2) private BigDecimal discount;
    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2) private BigDecimal finalAmount;
    @Enumerated(EnumType.STRING) @Column(name = "status", nullable = false) private InvoiceStatus status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by", nullable = false) private Staff issuedBy;
    @Column(name = "issued_at", updatable = false) private LocalDateTime issuedAt;
    @OneToMany(mappedBy = "invoice") private List<Payment> payments;
    @PrePersist void onCreate() { issuedAt = LocalDateTime.now(); if(status==null) status=InvoiceStatus.UNPAID; }
}
