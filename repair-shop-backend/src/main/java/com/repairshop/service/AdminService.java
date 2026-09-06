package com.repairshop.service;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AdminService {
    // Staff management
    StaffResponse createStaff(StaffRequest request);
    Page<StaffResponse> getStaff(int page, int size);
    StaffResponse updateStaff(Integer id, StaffRequest request);
    UserResponse toggleStaffLock(Integer id);
    StaffResponse updateStaffPosition(Integer id, String position);
    Page<TicketResponse> getStaffTickets(Integer id, int page, int size);

    // Customer management
    Page<CustomerResponse> getCustomers(String search, int page, int size);
    CustomerResponse getCustomerDetails(Integer id);
    void toggleCustomerLock(Integer id);

    // Inventory
    Page<PartResponse> getInventory(String search, int page, int size);
    Page<InventoryTransactionResponse> getInventoryTransactions(int page, int size);

    // Tickets
    Page<TicketResponse> getTickets(String status, Integer staffId, LocalDateTime from, LocalDateTime to, String search, int page, int size);
    TicketResponse getTicket(Integer id);

    // Invoices
    Page<InvoiceResponse> getInvoices(String status, LocalDateTime from, LocalDateTime to, String search, int page, int size);
    InvoiceResponse confirmPayment(Integer id);
    byte[] printInvoice(Integer id);

    // Notifications
    void broadcastNotification(BroadcastNotificationRequest request);
}
