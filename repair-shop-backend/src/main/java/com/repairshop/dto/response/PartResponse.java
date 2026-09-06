package com.repairshop.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PartResponse {
    private Integer partId;
    private String partCode;
    private String partName;
    private String unit;
    private BigDecimal unitPrice;
    private Integer quantityInStock;
    private Integer minStockThreshold;
    private String supplier;
    private boolean lowStock;
    private LocalDateTime createdAt;
}
