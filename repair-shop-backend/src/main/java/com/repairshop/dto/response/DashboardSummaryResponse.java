package com.repairshop.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data @Builder
public class DashboardSummaryResponse {
    private long totalTickets;
    private long activeTickets;
    private long completedTickets;
    private long totalCustomers;
    private long totalStaff;
    private BigDecimal totalRevenue;
    private Map<String, Long> ticketsByStatus;
}
