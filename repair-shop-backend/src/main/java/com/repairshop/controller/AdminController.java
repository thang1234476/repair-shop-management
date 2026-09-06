package com.repairshop.controller;

import com.repairshop.dto.request.BroadcastNotificationRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.*;
import com.repairshop.security.UserDetailsImpl;
import com.repairshop.service.AdminService;
import com.repairshop.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final DashboardService dashboardService;

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.createStaff(request)));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<Page<StaffResponse>>> getStaff(@RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getStaff(page, size)));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(@PathVariable Integer id, @Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.updateStaff(id, request)));
    }

    @PutMapping("/staff/{id}/lock")
    public ResponseEntity<ApiResponse<UserResponse>> toggleStaffLock(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.toggleStaffLock(id)));
    }

    @PutMapping("/staff/{id}/position")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaffPosition(@PathVariable Integer id, @RequestParam String position) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.updateStaffPosition(id, position)));
    }

    @GetMapping("/staff/{id}/tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getStaffTickets(@PathVariable Integer id,
                                                                             @RequestParam(defaultValue = "0") int page,
                                                                             @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getStaffTickets(id, page, size)));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getCustomers(@RequestParam(required = false) String search,
                                                                            @RequestParam(defaultValue = "0") int page,
                                                                            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getCustomers(search, page, size)));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getCustomerDetails(id)));
    }

    @PutMapping("/customers/{id}/lock")
    public ResponseEntity<ApiResponse<Void>> toggleCustomerLock(@PathVariable Integer id) {
        adminService.toggleCustomerLock(id);
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Page<PartResponse>>> getInventory(@RequestParam(required = false) String search,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getInventory(search, page, size)));
    }

    @GetMapping("/inventory/transactions")
    public ResponseEntity<ApiResponse<Page<InventoryTransactionResponse>>> getInventoryTransactions(@RequestParam(defaultValue = "0") int page,
                                                                                                    @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getInventoryTransactions(page, size)));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getTickets(@RequestParam(required = false) String status,
                                                                        @RequestParam(required = false) Integer staffId,
                                                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                                                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                                                                        @RequestParam(required = false) String search,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getTickets(status, staffId, from, to, search, page, size)));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getTicket(id)));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> getInvoices(@RequestParam(required = false) String status,
                                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                                                                          @RequestParam(required = false) String search,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getInvoices(status, from, to, search, page, size)));
    }

    @PutMapping("/invoices/{id}/confirm-payment")
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirmPayment(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.confirmPayment(id)));
    }

    @GetMapping("/invoices/{id}/print")
    public ResponseEntity<byte[]> printInvoice(@PathVariable Integer id) {
        byte[] pdf = adminService.printInvoice(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getSummary()));
    }

    @GetMapping("/dashboard/revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDashboardRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getRevenueByDateRange(from, to)));
    }

    @GetMapping("/dashboard/inventory-alerts")
    public ResponseEntity<ApiResponse<List<PartResponse>>> getInventoryAlerts() {
        return ResponseEntity.ok(ApiResponse.success("Success", dashboardService.getInventoryAlerts()));
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<ApiResponse<Void>> broadcastNotification(@Valid @RequestBody BroadcastNotificationRequest request) {
        adminService.broadcastNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }
}
