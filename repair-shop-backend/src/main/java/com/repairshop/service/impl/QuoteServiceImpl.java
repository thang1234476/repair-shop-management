package com.repairshop.service.impl;

import com.repairshop.dto.request.CreateQuoteRequest;
import com.repairshop.dto.request.QuoteResponseRequest;
import com.repairshop.dto.response.QuoteItemResponse;
import com.repairshop.dto.response.QuoteResponse;
import com.repairshop.entity.*;
import com.repairshop.enums.QuoteStatus;
import com.repairshop.enums.TicketStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.PartRepository;
import com.repairshop.repository.QuoteItemRepository;
import com.repairshop.repository.QuoteRepository;
import com.repairshop.repository.RepairTicketRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.repository.TicketStatusHistoryRepository;
import com.repairshop.service.NotificationService;
import com.repairshop.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuoteServiceImpl implements QuoteService {

    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;
    private final RepairTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final com.repairshop.repository.StaffRepository staffRepository;
    private final PartRepository partRepository;
    private final NotificationService notificationService;
    private final TicketStatusHistoryRepository historyRepository;

    @Override
    @Transactional
    public QuoteResponse createQuote(Integer ticketId, CreateQuoteRequest request, Integer staffId) {
        RepairTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Quote quote = new Quote();
        quote.setTicket(ticket);
        quote.setCreatedBy(staff);
        quote.setStatus(QuoteStatus.PENDING);
        quote = quoteRepository.save(quote);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var itemReq : request.getItems()) {
            QuoteItem item = new QuoteItem();
            item.setQuote(quote);
            
            if (itemReq.getPartId() != null) {
                Part part = partRepository.findById(itemReq.getPartId())
                    .orElseThrow(() -> new ResourceNotFoundException("Part not found"));
                item.setPart(part);
            }
            item.setDescription(itemReq.getDescription());
            item.setItemType(com.repairshop.enums.QuoteItemType.valueOf(itemReq.getItemType()));
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            BigDecimal itemTotal = itemReq.getUnitPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
            quoteItemRepository.save(item);
        }

        quote.setTotalAmount(totalAmount);
        quote = quoteRepository.save(quote);

        ticket.setStatus(TicketStatus.QUOTED);
        ticketRepository.save(ticket);
        
        TicketStatusHistory hist = new TicketStatusHistory();
        hist.setTicket(ticket);
        hist.setStatus(TicketStatus.QUOTED.name());
        hist.setNote("Báo giá đã được tạo");
        hist.setChangedBy(staff.getUser());
        historyRepository.save(hist);

        notificationService.notifyQuoteAvailable(quote);
        return mapToResponse(quote);
    }

    @Override
    @Transactional
    public QuoteResponse acceptQuote(Integer quoteId, QuoteResponseRequest request, Integer customerId) {
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new ResourceNotFoundException("Quote not found"));
            
        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("Quote is not pending");
        }

        quote.setStatus(QuoteStatus.ACCEPTED);
        quote.setRespondedAt(LocalDateTime.now());
        quote.setCustomerNote(request.getCustomerNote());
        quote = quoteRepository.save(quote);

        RepairTicket ticket = quote.getTicket();
        ticket.setStatus(TicketStatus.APPROVED);
        ticketRepository.save(ticket);
        
        User customer = userRepository.findById(customerId).orElse(null);
        TicketStatusHistory hist = new TicketStatusHistory();
        hist.setTicket(ticket);
        hist.setStatus(TicketStatus.APPROVED.name());
        hist.setNote("Khách hàng đã đồng ý báo giá");
        hist.setChangedBy(customer);
        historyRepository.save(hist);

        notificationService.notifyQuoteConfirmed(quote, quote.getCreatedBy());
        return mapToResponse(quote);
    }

    @Override
    @Transactional
    public QuoteResponse rejectQuote(Integer quoteId, QuoteResponseRequest request, Integer customerId) {
        Quote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new ResourceNotFoundException("Quote not found"));
            
        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("Quote is not pending");
        }

        quote.setStatus(QuoteStatus.REJECTED);
        quote.setRespondedAt(LocalDateTime.now());
        quote.setCustomerNote(request.getCustomerNote());
        quote = quoteRepository.save(quote);

        RepairTicket ticket = quote.getTicket();
        ticket.setStatus(TicketStatus.REJECTED);
        ticketRepository.save(ticket);
        
        User customer = userRepository.findById(customerId).orElse(null);
        TicketStatusHistory hist = new TicketStatusHistory();
        hist.setTicket(ticket);
        hist.setStatus(TicketStatus.REJECTED.name());
        hist.setNote("Khách hàng đã từ chối báo giá");
        hist.setChangedBy(customer);
        historyRepository.save(hist);

        notificationService.notifyQuoteRejected(quote, quote.getCreatedBy());
        return mapToResponse(quote);
    }

    public QuoteResponse getQuote(Integer quoteId) {
        return mapToResponse(quoteRepository.findById(quoteId)
            .orElseThrow(() -> new ResourceNotFoundException("Quote not found")));
    }

    @Override
    public List<QuoteResponse> getQuotesByTicket(Integer ticketId) {
        // Just return the latest one if multiple exist, or adjust as needed. 
        // For simplicity returning the first found as a list
        return quoteRepository.findByTicketTicketId(ticketId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private QuoteResponse mapToResponse(Quote q) {
        QuoteResponse r = new QuoteResponse();
        r.setQuoteId(q.getQuoteId());
        if (q.getTicket() != null) r.setTicketId(q.getTicket().getTicketId());
        if (q.getCreatedBy() != null && q.getCreatedBy().getUser() != null) r.setCreatedByName(q.getCreatedBy().getUser().getFullName());
        r.setTotalAmount(q.getTotalAmount());
        r.setStatus(q.getStatus().name());
        r.setCustomerNote(q.getCustomerNote());
        r.setCreatedAt(q.getCreatedAt());
        r.setRespondedAt(q.getRespondedAt());
        
        List<QuoteItemResponse> items = quoteItemRepository.findByQuoteQuoteId(q.getQuoteId()).stream().map(qi -> {
            QuoteItemResponse ir = new QuoteItemResponse();
            ir.setQuoteItemId(qi.getQuoteItemId());
            if (qi.getPart() != null) {
                ir.setPartId(qi.getPart().getPartId());
                ir.setPartName(qi.getPart().getPartName());
            }
            ir.setItemType(qi.getItemType().name());
            ir.setDescription(qi.getDescription());
            ir.setQuantity(qi.getQuantity());
            ir.setUnitPrice(qi.getUnitPrice());
            ir.setSubtotal(qi.getUnitPrice().multiply(new BigDecimal(qi.getQuantity())));
            return ir;
        }).collect(Collectors.toList());
        r.setItems(items);
        return r;
    }
}
