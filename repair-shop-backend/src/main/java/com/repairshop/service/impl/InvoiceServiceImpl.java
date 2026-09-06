package com.repairshop.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.repairshop.dto.request.CreateInvoiceRequest;
import com.repairshop.dto.request.CreatePaymentRequest;
import com.repairshop.dto.response.InvoiceResponse;
import com.repairshop.dto.response.PaymentResponse;
import com.repairshop.entity.*;
import com.repairshop.enums.InvoiceStatus;
import com.repairshop.enums.PaymentMethod;
import com.repairshop.enums.QuoteStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.*;
import com.repairshop.service.InvoiceService;
import com.repairshop.util.InvoiceCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final RepairTicketRepository ticketRepository;
    private final QuoteRepository quoteRepository;
    private final StaffRepository staffRepository;
    private final InvoiceCodeGenerator invoiceCodeGenerator;

    @Override
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request, Integer staffId) {
        RepairTicket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        // Get accepted quote to use as subtotal base
        Quote quote = quoteRepository.findByTicketTicketIdAndStatus(ticket.getTicketId(), QuoteStatus.ACCEPTED)
            .orElse(null);

        BigDecimal subtotal = quote != null ? quote.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal finalAmount = subtotal.add(tax).subtract(discount);

        Staff issuedBy = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceCode(invoiceCodeGenerator.generate());
        invoice.setTicket(ticket);
        invoice.setCustomer(ticket.getCustomer());
        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setDiscount(discount);
        invoice.setFinalAmount(finalAmount);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setIssuedBy(issuedBy);

        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public PaymentResponse recordPayment(CreatePaymentRequest request, Integer receivedById) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        User receivedBy = staffRepository.findById(receivedById)
            .map(Staff::getUser)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setReceivedBy(receivedBy);
        payment.setNote(request.getNote());
        payment = paymentRepository.save(payment);

        // Recompute paid amount and update status
        BigDecimal totalPaid = paymentRepository.sumPaymentsByInvoice(invoice.getInvoiceId());
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        if (totalPaid.compareTo(invoice.getFinalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        return mapPaymentToResponse(payment, totalPaid);
    }

    @Override
    public InvoiceResponse getInvoice(Integer invoiceId) {
        return mapToResponse(invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId)));
    }

    @Override
    public Page<InvoiceResponse> getAllInvoices(InvoiceStatus status, LocalDateTime from, LocalDateTime to,
                                                String search, Pageable pageable) {
        return invoiceRepository.findWithFilters(status, from, to, search, pageable).map(this::mapToResponse);
    }

    @Override
    public byte[] exportInvoicePdf(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return generatePdf(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPayment(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        invoice.setStatus(InvoiceStatus.PAID);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    private byte[] generatePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
            doc.add(new Paragraph("HOA DON DICH VU SUA CHUA", titleFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Ma hoa don: " + invoice.getInvoiceCode()));
            doc.add(new Paragraph("Khach hang: " +
                (invoice.getCustomer() != null && invoice.getCustomer().getUser() != null
                    ? invoice.getCustomer().getUser().getFullName() : "N/A")));
            if (invoice.getTicket() != null) {
                doc.add(new Paragraph("Ma phieu: " + invoice.getTicket().getTicketCode()));
            }
            doc.add(new Paragraph("Thanh tien: " + invoice.getSubtotal()));
            doc.add(new Paragraph("Thue: " + invoice.getTax()));
            doc.add(new Paragraph("Giam gia: " + invoice.getDiscount()));
            doc.add(new Paragraph("Tong cong: " + invoice.getFinalAmount()));
            doc.add(new Paragraph("Trang thai: " + invoice.getStatus().name()));
            if (invoice.getIssuedAt() != null) {
                doc.add(new Paragraph("Ngay xuat: " + invoice.getIssuedAt().toString()));
            }
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private InvoiceResponse mapToResponse(Invoice inv) {
        InvoiceResponse r = new InvoiceResponse();
        r.setInvoiceId(inv.getInvoiceId());
        r.setInvoiceCode(inv.getInvoiceCode());
        if (inv.getTicket() != null) r.setTicketId(inv.getTicket().getTicketId());
        if (inv.getCustomer() != null) {
            r.setCustomerId(inv.getCustomer().getCustomerId());
            if (inv.getCustomer().getUser() != null) r.setCustomerName(inv.getCustomer().getUser().getFullName());
        }
        r.setSubtotal(inv.getSubtotal());
        r.setTax(inv.getTax());
        r.setDiscount(inv.getDiscount());
        r.setFinalAmount(inv.getFinalAmount());
        r.setStatus(inv.getStatus().name());
        r.setIssuedAt(inv.getIssuedAt());

        if (inv.getIssuedBy() != null && inv.getIssuedBy().getUser() != null) {
            r.setIssuedBy(inv.getIssuedBy().getUser().getFullName());
        }

        // Compute paid amount from payments
        BigDecimal paidAmount = BigDecimal.ZERO;
        if (inv.getInvoiceId() != null) {
            BigDecimal sum = paymentRepository.sumPaymentsByInvoice(inv.getInvoiceId());
            if (sum != null) paidAmount = sum;
        }
        r.setPaidAmount(paidAmount);
        // r.setRemainingAmount(inv.getFinalAmount().subtract(paidAmount));

        return r;
    }

    private PaymentResponse mapPaymentToResponse(Payment p, BigDecimal totalPaid) {
        PaymentResponse r = new PaymentResponse();
        r.setPaymentId(p.getPaymentId());
        // r.setInvoiceId(p.getInvoice().getInvoiceId());
        r.setAmount(p.getAmount());
        r.setPaymentMethod(p.getPaymentMethod().name());
        r.setPaymentDate(p.getPaymentDate());
        r.setNote(p.getNote());
        if (p.getReceivedBy() != null) r.setReceivedBy(p.getReceivedBy().getFullName());
        return r;
    }
}
