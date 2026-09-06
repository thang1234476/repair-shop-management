package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketStatusHistoryResponse {
    private Integer historyId;
    private String status;
    private String note;
    private String changedBy;
    private LocalDateTime changedAt;
}
