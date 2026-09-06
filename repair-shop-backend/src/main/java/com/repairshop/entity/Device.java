package com.repairshop.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "devices")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Device {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_id") private Integer deviceId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @Column(name = "device_type", nullable = false, length = 50) private String deviceType;
    @Column(name = "brand", length = 50) private String brand;
    @Column(name = "model", length = 100) private String model;
    @Column(name = "serial_number", length = 100) private String serialNumber;
    @Column(name = "imei", length = 50) private String imei;
    @Column(name = "initial_condition", columnDefinition = "TEXT") private String initialCondition;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
}
