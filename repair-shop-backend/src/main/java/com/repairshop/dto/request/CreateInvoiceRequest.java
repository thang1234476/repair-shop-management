package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateInvoiceRequest {
    @NotNull private Integer ticketId;
    private BigDecimal tax;
    private BigDecimal discount;
}
