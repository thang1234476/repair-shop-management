package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePartRequest {
    @NotBlank @Size(max=30) private String partCode;
    @NotBlank @Size(max=100) private String partName;
    @Size(max=20) private String unit;
    @NotNull @DecimalMin("0") private BigDecimal unitPrice;
    @NotNull @Min(0) private Integer quantityInStock;
    @Min(0) private Integer minStockThreshold;
    @Size(max=100) private String supplier;
}
