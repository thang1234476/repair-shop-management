package com.repairshop.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponse {
    private Integer invoiceId;
    private String invoiceCode;
    private Integer ticketId;
    private String ticketCode;
    private Integer customerId;
    private String customerName;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private BigDecimal paidAmount;
    private String status;
    private String issuedBy;
    private LocalDateTime issuedAt;
    private List<PaymentResponse> payments;
}
