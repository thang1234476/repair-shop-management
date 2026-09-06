package com.repairshop.service.impl;

import com.repairshop.dto.request.CreateTicketRequest;
import com.repairshop.dto.request.DiagnosisRequest;
import com.repairshop.dto.request.UpdateTicketStatusRequest;
import com.repairshop.dto.response.TicketResponse;
import com.repairshop.dto.response.TicketStatusHistoryResponse;
import com.repairshop.entity.*;
import com.repairshop.enums.TicketStatus;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.*;
import com.repairshop.service.NotificationService;
import com.repairshop.service.TicketService;
import com.repairshop.util.QrCodeUtil;
import com.repairshop.util.TicketCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final RepairTicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final DeviceRepository deviceRepository;
    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final TicketStatusHistoryRepository historyRepository;
    private final NotificationService notificationService;
    private final TicketCodeGenerator codeGen;
    private final QrCodeUtil qrCodeUtil;

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, Integer staffId) {
        Customer customer = customerRepository.findById(request.getCustomerId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Device device = deviceRepository.findById(request.getDeviceId())
            .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        RepairTicket ticket = new RepairTicket();
        ticket.setTicketCode(codeGen.generate());
        ticket.setCustomer(customer);
        ticket.setDevice(device);
        ticket.setIssueDescription(request.getIssueDescription());
        ticket.setStatus(TicketStatus.RECEIVED);

        // Assign staff
        if (request.getStaffId() != null) {
            ticket.setStaff(staffRepository.findById(request.getStaffId()).orElse(null));
        } else if (staffId != null) {
            ticket.setStaff(staffRepository.findById(staffId).orElse(null));
        }

        ticket = ticketRepository.save(ticket);

        // Record status history
        User changedBy = staffId != null ? userRepository.findById(staffId).orElse(null) : null;
        saveStatusHistory(ticket, TicketStatus.RECEIVED.name(), "Tiếp nhận thiết bị", changedBy);

        notificationService.notifyTicketCreated(ticket);
        return mapToResponse(ticket);
    }

    @Override
    public TicketResponse getTicket(Integer ticketId) {
        return mapToResponse(ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId)));
    }

    @Override
    public TicketResponse getTicketByCode(String ticketCode) {
        return mapToResponse(ticketRepository.findByTicketCode(ticketCode)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode)));
    }

    @Override
    public Page<TicketResponse> getCustomerTickets(Integer customerId, TicketStatus status, Pageable pageable) {
        if (status != null) {
            return ticketRepository.findByCustomerCustomerIdAndStatus(customerId, status, pageable)
                .map(this::mapToResponse);
        }
        return ticketRepository.findByCustomerCustomerId(customerId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<TicketResponse> getStaffTickets(Integer staffId, Pageable pageable) {
        return ticketRepository.findByStaffStaffId(staffId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<TicketResponse> getAllTickets(TicketStatus status, Integer staffId, LocalDateTime from,
                                              LocalDateTime to, String search, Pageable pageable) {
        return ticketRepository.findWithFilters(status, staffId, from, to, search, pageable)
            .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public TicketResponse updateStatus(Integer ticketId, UpdateTicketStatusRequest request, Integer changedById) {
        RepairTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        TicketStatus newStatus = TicketStatus.valueOf(request.getStatus());
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.COMPLETED) {
            ticket.setCompletedAt(LocalDateTime.now());
        }
        ticketRepository.save(ticket);

        User changedBy = changedById != null ? userRepository.findById(changedById).orElse(null) : null;
        saveStatusHistory(ticket, newStatus.name(), request.getNote(), changedBy);

        if (newStatus == TicketStatus.COMPLETED) {
            notificationService.notifyTicketCompleted(ticket);
        }

        return mapToResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse updateDiagnosis(Integer ticketId, DiagnosisRequest request) {
        RepairTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setDiagnosisNotes(request.getDiagnosisNotes());
        if (ticket.getStatus() == TicketStatus.RECEIVED) {
            ticket.setStatus(TicketStatus.DIAGNOSING);
            saveStatusHistory(ticket, TicketStatus.DIAGNOSING.name(), "Đang chẩn đoán", null);
        }
        return mapToResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse closeTicket(Integer ticketId, Integer staffId) {
        RepairTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setStatus(TicketStatus.DELIVERED);
        ticketRepository.save(ticket);

        User changedBy = staffId != null ? userRepository.findById(staffId).orElse(null) : null;
        saveStatusHistory(ticket, TicketStatus.DELIVERED.name(), "Bàn giao thiết bị cho khách", changedBy);
        return mapToResponse(ticket);
    }

    @Override
    public List<TicketStatusHistoryResponse> getTicketTimeline(Integer ticketId) {
        return historyRepository.findByTicketTicketIdOrderByChangedAtAsc(ticketId).stream()
            .map(h -> {
                TicketStatusHistoryResponse r = new TicketStatusHistoryResponse();
                r.setHistoryId(h.getHistoryId());
                r.setStatus(h.getStatus()); // already String
                r.setNote(h.getNote());
                if (h.getChangedBy() != null) r.setChangedBy(h.getChangedBy().getFullName());
                r.setChangedAt(h.getChangedAt());
                return r;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<TicketResponse> getTicketsByDeviceId(Integer deviceId) {
        return ticketRepository.findAll().stream()
            .filter(t -> t.getDevice() != null && t.getDevice().getDeviceId().equals(deviceId))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private void saveStatusHistory(RepairTicket ticket, String status, String note, User changedBy) {
        TicketStatusHistory hist = new TicketStatusHistory();
        hist.setTicket(ticket);
        hist.setStatus(status); // String, not enum
        hist.setNote(note);
        hist.setChangedBy(changedBy);
        historyRepository.save(hist);
    }

    private TicketResponse mapToResponse(RepairTicket t) {
        TicketResponse r = new TicketResponse();
        r.setTicketId(t.getTicketId());
        r.setTicketCode(t.getTicketCode());

        if (t.getCustomer() != null) {
            r.setCustomerId(t.getCustomer().getCustomerId());
            if (t.getCustomer().getUser() != null) {
                r.setCustomerName(t.getCustomer().getUser().getFullName());
            }
        }
        if (t.getDevice() != null) {
            r.setDeviceId(t.getDevice().getDeviceId());
            r.setDeviceType(t.getDevice().getDeviceType());
            r.setDeviceBrand(t.getDevice().getBrand());
            r.setDeviceModel(t.getDevice().getModel());
        }
        if (t.getStaff() != null) {
            r.setStaffId(t.getStaff().getStaffId());
            if (t.getStaff().getUser() != null) {
                r.setStaffName(t.getStaff().getUser().getFullName());
            }
        }
        r.setStatus(t.getStatus().name());
        r.setIssueDescription(t.getIssueDescription());
        r.setDiagnosisNotes(t.getDiagnosisNotes());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        r.setCompletedAt(t.getCompletedAt());

        // Generate QR code on-the-fly (not stored in DB)
        try {
            r.setQrCodeBase64(qrCodeUtil.generateQrCodeBase64(t.getTicketCode(), 200, 200));
        } catch (Exception e) {
            r.setQrCodeBase64(null);
        }
        return r;
    }
}
