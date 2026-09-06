package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuoteItemRequest {
    @NotBlank private String itemType; // PART, LABOR, OTHER
    private Integer partId;
    @NotBlank private String description;
    @NotNull @Min(1) private Integer quantity;
    @NotNull @DecimalMin("0") private BigDecimal unitPrice;
}
