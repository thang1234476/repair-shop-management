package com.repairshop.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Integer paymentId;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String receivedBy;
    private String note;
}
