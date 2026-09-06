package com.repairshop.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "parts")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Part {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "part_id") private Integer partId;
    @Column(name = "part_code", nullable = false, unique = true, length = 30) private String partCode;
    @Column(name = "part_name", nullable = false, length = 100) private String partName;
    @Column(name = "unit", length = 20) private String unit;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(name = "quantity_in_stock", nullable = false) private Integer quantityInStock;
    @Column(name = "min_stock_threshold") private Integer minStockThreshold;
    @Column(name = "supplier", length = 100) private String supplier;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
}
