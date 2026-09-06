package com.repairshop.service.impl;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.*;
import com.repairshop.enums.InvoiceStatus;
import com.repairshop.enums.TicketStatus;
import com.repairshop.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final StaffService staffService;
    private final CustomerService customerService;
    private final InventoryService inventoryService;
    private final TicketService ticketService;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;

    @Override
    public StaffResponse createStaff(StaffRequest request) {
        return staffService.createStaff(request);
    }

    @Override
    public Page<StaffResponse> getStaff(int page, int size) {
        return staffService.getAllStaff(PageRequest.of(page, size));
    }

    @Override
    public StaffResponse updateStaff(Integer id, StaffRequest request) {
        return staffService.updateStaff(id, request);
    }

    @Override
    public UserResponse toggleStaffLock(Integer id) {
        staffService.lockUnlockStaff(id);
        return new UserResponse(); // simplified
    }

    @Override
    public StaffResponse updateStaffPosition(Integer id, String position) {
        return staffService.updatePosition(id, position);
    }

    @Override
    public Page<TicketResponse> getStaffTickets(Integer id, int page, int size) {
        return ticketService.getStaffTickets(id, PageRequest.of(page, size));
    }

    @Override
    public Page<CustomerResponse> getCustomers(String search, int page, int size) {
        return customerService.getAllCustomers(search, PageRequest.of(page, size));
    }

    @Override
    public CustomerResponse getCustomerDetails(Integer id) {
        return customerService.getCustomer(id);
    }

    @Override
    public void toggleCustomerLock(Integer id) {
        customerService.lockUnlockCustomer(id);
    }

    @Override
    public Page<PartResponse> getInventory(String search, int page, int size) {
        return inventoryService.getAllParts(search, PageRequest.of(page, size));
    }

    @Override
    public Page<InventoryTransactionResponse> getInventoryTransactions(int page, int size) {
        return inventoryService.getTransactions(PageRequest.of(page, size));
    }

    @Override
    public Page<TicketResponse> getTickets(String status, Integer staffId, LocalDateTime from, LocalDateTime to, String search, int page, int size) {
        TicketStatus ticketStatus = status != null ? TicketStatus.valueOf(status) : null;
        return ticketService.getAllTickets(ticketStatus, staffId, from, to, search, PageRequest.of(page, size));
    }

    @Override
    public TicketResponse getTicket(Integer id) {
        return ticketService.getTicket(id);
    }

    @Override
    public Page<InvoiceResponse> getInvoices(String status, LocalDateTime from, LocalDateTime to, String search, int page, int size) {
        InvoiceStatus invoiceStatus = status != null ? InvoiceStatus.valueOf(status) : null;
        return invoiceService.getAllInvoices(invoiceStatus, from, to, search, PageRequest.of(page, size));
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPayment(Integer id) {
        return invoiceService.confirmPayment(id);
    }

    @Override
    public byte[] printInvoice(Integer id) {
        return invoiceService.exportInvoicePdf(id);
    }

    @Override
    public void broadcastNotification(BroadcastNotificationRequest request) {
        notificationService.broadcastToCustomers(request);
    }
}
