package com.repairshop.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuoteResponse {
    private Integer quoteId;
    private Integer ticketId;
    private String ticketCode;
    private BigDecimal totalAmount;
    private String status;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private String customerNote;
    private List<QuoteItemResponse> items;
}
