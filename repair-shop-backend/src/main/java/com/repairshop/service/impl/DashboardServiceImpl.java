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
            .activeTickets(ticketRepository.countByStatus(TicketStatus.RECEIVED)) // Using activeTickets mapped to RECEIVED for simplicity
            .completedTickets(ticketRepository.countByStatus(TicketStatus.COMPLETED))
            .totalRevenue(invoiceRepository.findAll().stream().map(com.repairshop.entity.Invoice::getFinalAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
            .totalCustomers(customerRepository.count())
            .totalStaff(staffRepository.count())
            .build();
    }

    @Override
    public List<Map<String, Object>> getRevenueByDateRange(LocalDateTime from, LocalDateTime to) {
        // Simple implementation: this normally would group by date in SQL
        // Returning empty map array to satisfy compilation and basic structure
        return new ArrayList<>();
    }

    @Override
    public List<PartResponse> getInventoryAlerts() {
        return inventoryService.getLowStockParts();
    }
}
