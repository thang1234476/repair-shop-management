package com.repairshop.service;
import com.repairshop.dto.request.*;
import com.repairshop.dto.response.*;
import com.repairshop.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface InvoiceService {
    InvoiceResponse createInvoice(CreateInvoiceRequest request, Integer staffId);
    PaymentResponse recordPayment(CreatePaymentRequest request, Integer receivedById);
    InvoiceResponse getInvoice(Integer invoiceId);
    Page<InvoiceResponse> getAllInvoices(InvoiceStatus status, LocalDateTime from, LocalDateTime to, String search, Pageable pageable);
    byte[] exportInvoicePdf(Integer invoiceId);
    InvoiceResponse confirmPayment(Integer invoiceId);
}
