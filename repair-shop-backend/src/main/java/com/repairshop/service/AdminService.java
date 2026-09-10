package com.repairshop.service;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.request.CreatePartRequest;
import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.request.InventoryImportRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

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

    CustomerResponse updateCustomer(Integer id, CustomerProfileRequest request);

    UserResponse toggleCustomerLock(Integer id);

    List<DeviceResponse> getCustomerDevices(Integer id);

    Page<TicketResponse> getCustomerTickets(Integer id, int page, int size);

    // Inventory
    Page<PartResponse> getInventory(String search, int page, int size);

    PartResponse createPart(CreatePartRequest request);

    PartResponse updatePart(Integer id, CreatePartRequest request);

    InventoryTransactionResponse importStock(InventoryImportRequest request, Integer userId);

    Page<InventoryTransactionResponse> getInventoryTransactions(int page, int size);

    // Tickets
    Page<TicketResponse> getTickets(String status, Integer staffId, LocalDateTime from, LocalDateTime to, String search,
            int page, int size);

    TicketResponse getTicket(Integer id);

    TicketResponse assignStaffToTicket(Integer ticketId, Integer staffId);

    // Invoices
    Page<InvoiceResponse> getInvoices(String status, LocalDateTime from, LocalDateTime to, String search, int page,
            int size);

    InvoiceResponse confirmPayment(Integer id);

    byte[] printInvoice(Integer id);

    // Notifications
    void broadcastNotification(BroadcastNotificationRequest request);
}
