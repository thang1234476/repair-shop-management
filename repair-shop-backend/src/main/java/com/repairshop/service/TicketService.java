package com.repairshop.service;
import com.repairshop.dto.request.*;
import com.repairshop.dto.response.*;
import com.repairshop.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, Integer staffId);
    TicketResponse getTicket(Integer ticketId);
    TicketResponse getTicketByCode(String ticketCode);
    Page<TicketResponse> getCustomerTickets(Integer customerId, TicketStatus status, Pageable pageable);
    Page<TicketResponse> getStaffTickets(Integer staffId, Pageable pageable);
    Page<TicketResponse> getAllTickets(TicketStatus status, Integer staffId, LocalDateTime from, LocalDateTime to, String search, Pageable pageable);
    TicketResponse updateStatus(Integer ticketId, UpdateTicketStatusRequest request, Integer changedById);
    TicketResponse updateDiagnosis(Integer ticketId, DiagnosisRequest request);
    TicketResponse closeTicket(Integer ticketId, Integer staffId);
    List<TicketStatusHistoryResponse> getTicketTimeline(Integer ticketId);
    List<TicketResponse> getTicketsByDeviceId(Integer deviceId);
}
