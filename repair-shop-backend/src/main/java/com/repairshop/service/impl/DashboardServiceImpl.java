package com.repairshop.service.impl;

import com.repairshop.dto.response.DashboardSummaryResponse;
import com.repairshop.dto.response.PartResponse;
import com.repairshop.enums.TicketStatus;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.InvoiceRepository;
import com.repairshop.repository.RepairTicketRepository;
import com.repairshop.repository.StaffRepository;
import com.repairshop.service.DashboardService;
import com.repairshop.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final RepairTicketRepository ticketRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final InventoryService inventoryService;

    @Override
    public DashboardSummaryResponse getSummary() {
        return DashboardSummaryResponse.builder()
            .totalTickets(ticketRepository.count())
            .activeTickets(ticketRepository.countByStatus(TicketStatus.RECEIVED))
            .completedTickets(ticketRepository.countByStatus(TicketStatus.COMPLETED))
            .totalRevenue(invoiceRepository.findAll().stream()
                .map(com.repairshop.entity.Invoice::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add))
            .totalCustomers(customerRepository.count())
            .totalStaff(staffRepository.count())
            .build();
    }

    @Override
    public List<Map<String, Object>> getRevenueByDateRange(LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = invoiceRepository.getRevenueByDay(from, to);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            // row[0]: java.sql.Date or String depending on DB driver
            String dateStr = row[0] != null ? row[0].toString() : "";
            // row[1]: BigDecimal revenue
            BigDecimal revenue = row[1] instanceof BigDecimal
                ? (BigDecimal) row[1]
                : new BigDecimal(row[1].toString());
            entry.put("date", dateStr);
            entry.put("revenue", revenue);
            result.add(entry);
        }
        return result;
    }

    @Override
    public List<PartResponse> getInventoryAlerts() {
        return inventoryService.getLowStockParts();
    }
}
