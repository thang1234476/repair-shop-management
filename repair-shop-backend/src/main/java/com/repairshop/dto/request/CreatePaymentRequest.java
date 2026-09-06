package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {
    @NotNull private Integer invoiceId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    @NotBlank private String paymentMethod; // CASH, BANK_TRANSFER, CARD, E_WALLET
    private String note;
}
