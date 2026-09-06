package com.repairshop.dto.response;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class QuoteItemResponse {
    private Integer quoteItemId;
    private String itemType;
    private Integer partId;
    private String partName;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
