package com.repairshop.entity;
import com.repairshop.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "payments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id") private Integer paymentId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false) private Invoice invoice;
    @Column(name = "amount", nullable = false, precision = 12, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method", nullable = false) private PaymentMethod paymentMethod;
    @Column(name = "payment_date") private LocalDateTime paymentDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by", nullable = false) private User receivedBy;
    @Column(name = "note", columnDefinition = "TEXT") private String note;
    @PrePersist void onCreate() { paymentDate = LocalDateTime.now(); }
}
