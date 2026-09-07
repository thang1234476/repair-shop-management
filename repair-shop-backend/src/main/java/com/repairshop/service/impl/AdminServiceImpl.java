package com.repairshop.service.impl;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.request.CreatePartRequest;
import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.request.InventoryImportRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.*;
import com.repairshop.enums.InvoiceStatus;
import com.repairshop.enums.TicketStatus;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.RepairTicketRepository;
import com.repairshop.repository.StaffRepository;
import com.repairshop.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final StaffService staffService;
    private final CustomerService customerService;
    private final DeviceService deviceService;
    private final InventoryService inventoryService;
    private final TicketService ticketService;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;
    private final RepairTicketRepository ticketRepository;
    private final StaffRepository staffRepository;

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
    public CustomerResponse updateCustomer(Integer id, CustomerProfileRequest request) {
        return customerService.updateProfile(id, request);
    }

    @Override
    @Transactional
    public UserResponse toggleCustomerLock(Integer id) {
        customerService.lockUnlockCustomer(id);
        CustomerResponse c = customerService.getCustomer(id);
        UserResponse u = new UserResponse();
        u.setUserId(c.getCustomerId());
        u.setFullName(c.getFullName());
        u.setStatus(c.getStatus());
        return u;
    }

    @Override
    public List<DeviceResponse> getCustomerDevices(Integer id) {
        return deviceService.getCustomerDevices(id);
    }

    @Override
    public Page<TicketResponse> getCustomerTickets(Integer id, int page, int size) {
        return ticketService.getCustomerTickets(id, null, PageRequest.of(page, size));
    }

    @Override
    public Page<PartResponse> getInventory(String search, int page, int size) {
        return inventoryService.getAllParts(search, PageRequest.of(page, size));
    }

    @Override
    public PartResponse createPart(CreatePartRequest request) {
        return inventoryService.createPart(request);
    }

    @Override
    public PartResponse updatePart(Integer id, CreatePartRequest request) {
        return inventoryService.updatePart(id, request);
    }

    @Override
    public InventoryTransactionResponse importStock(InventoryImportRequest request, Integer userId) {
        return inventoryService.importParts(request, userId);
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
    @Transactional
    public com.repairshop.dto.response.TicketResponse assignStaffToTicket(Integer ticketId, Integer staffId) {
        com.repairshop.entity.RepairTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        com.repairshop.entity.Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        ticket.setStaff(staff);
        ticketRepository.save(ticket);
        return ticketService.getTicket(ticketId);
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
