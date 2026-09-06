package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryTransactionResponse {
    private Integer transactionId;
    private Integer partId;
    private String partName;
    private String type;
    private Integer quantity;
    private Integer relatedTicketId;
    private String relatedTicketCode;
    private String performedBy;
    private LocalDateTime transactionDate;
    private String note;
}
