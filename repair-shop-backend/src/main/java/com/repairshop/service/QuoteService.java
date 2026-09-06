package com.repairshop.service;
import com.repairshop.dto.request.*;
import com.repairshop.dto.response.*;
import java.util.List;

public interface QuoteService {
    QuoteResponse createQuote(Integer ticketId, CreateQuoteRequest request, Integer staffId);
    List<QuoteResponse> getQuotesByTicket(Integer ticketId);
    QuoteResponse acceptQuote(Integer quoteId, QuoteResponseRequest request, Integer customerId);
    QuoteResponse rejectQuote(Integer quoteId, QuoteResponseRequest request, Integer customerId);
}
