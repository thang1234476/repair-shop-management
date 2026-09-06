package com.repairshop.service;

import com.repairshop.dto.response.DashboardSummaryResponse;
import com.repairshop.dto.response.PartResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface DashboardService {
    DashboardSummaryResponse getSummary();
    List<Map<String, Object>> getRevenueByDateRange(LocalDateTime from, LocalDateTime to);
    List<PartResponse> getInventoryAlerts();
}
