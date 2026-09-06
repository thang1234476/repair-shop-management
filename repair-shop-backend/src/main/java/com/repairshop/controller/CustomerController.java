package com.repairshop.controller;

import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.request.DeviceRequest;
import com.repairshop.dto.request.QuoteResponseRequest;
import com.repairshop.dto.response.*;
import com.repairshop.enums.TicketStatus;
import com.repairshop.security.UserDetailsImpl;
import com.repairshop.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.repairshop.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final DeviceService deviceService;
    private final TicketService ticketService;
    private final QuoteService quoteService;
    private final NotificationService notificationService;

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateProfile(@Valid @RequestBody CustomerProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", customerService.updateProfile(getCurrentUser().getUserId(), request)));
    }

    @PostMapping("/devices")
    public ResponseEntity<ApiResponse<DeviceResponse>> addDevice(@Valid @RequestBody DeviceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", deviceService.createDevice(request, getCurrentUser().getUserId())));
    }

    @PutMapping("/devices/{id}")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateDevice(@PathVariable Integer id, @Valid @RequestBody DeviceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", deviceService.updateDevice(id, request, getCurrentUser().getUserId())));
    }

    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getDevices() {
        return ResponseEntity.ok(ApiResponse.success("Success", deviceService.getCustomerDevices(getCurrentUser().getUserId())));
    }

    @GetMapping("/devices/{id}")
    public ResponseEntity<ApiResponse<DeviceResponse>> getDevice(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", deviceService.getDevice(id)));
    }

    @GetMapping("/devices/{id}/history")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getDeviceHistory(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", deviceService.getDeviceRepairHistory(id)));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getTickets(@RequestParam(required = false) String status,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "10") int size) {
        TicketStatus ts = status != null ? TicketStatus.valueOf(status) : null;
        return ResponseEntity.ok(ApiResponse.success("Success", ticketService.getCustomerTickets(getCurrentUser().getUserId(), ts, PageRequest.of(page, size))));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", ticketService.getTicket(id)));
    }

    @GetMapping("/tickets/{id}/timeline")
    public ResponseEntity<ApiResponse<List<TicketStatusHistoryResponse>>> getTicketTimeline(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", ticketService.getTicketTimeline(id)));
    }

    @GetMapping("/tickets/lookup/{ticketCode}")
    public ResponseEntity<ApiResponse<TicketResponse>> lookupTicket(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ApiResponse.success("Success", ticketService.getTicketByCode(ticketCode)));
    }

    @GetMapping("/tickets/{id}/quote")
    public ResponseEntity<ApiResponse<QuoteResponse>> getTicketQuote(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Success", quoteService.getQuotesByTicket(id).stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("Quote not found"))));
    }

    @PutMapping("/quotes/{id}/accept")
    public ResponseEntity<ApiResponse<QuoteResponse>> acceptQuote(@PathVariable Integer id, @Valid @RequestBody QuoteResponseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", quoteService.acceptQuote(id, request, getCurrentUser().getUserId())));
    }

    @PutMapping("/quotes/{id}/reject")
    public ResponseEntity<ApiResponse<QuoteResponse>> rejectQuote(@PathVariable Integer id, @Valid @RequestBody QuoteResponseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", quoteService.rejectQuote(id, request, getCurrentUser().getUserId())));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(@RequestParam(defaultValue = "0") int page,
                                                                                    @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Success", notificationService.getNotifications(getCurrentUser().getUserId(), PageRequest.of(page, size))));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markNotificationRead(@PathVariable Integer id) {
        notificationService.markAsRead(id, getCurrentUser().getUserId());
        return ResponseEntity.ok(ApiResponse.success("Success", null));
    }
}
