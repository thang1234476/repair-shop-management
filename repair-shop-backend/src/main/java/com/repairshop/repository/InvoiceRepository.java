package com.repairshop.repository;
import com.repairshop.entity.Invoice;
import com.repairshop.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByTicketTicketId(Integer ticketId);
    Optional<Invoice> findByInvoiceCode(String invoiceCode);
    
    @Query("SELECT i FROM Invoice i WHERE " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:from IS NULL OR i.issuedAt >= :from) AND " +
           "(:to IS NULL OR i.issuedAt <= :to) AND " +
           "(:search IS NULL OR LOWER(i.invoiceCode) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Invoice> findWithFilters(@Param("status") InvoiceStatus status,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to,
                                   @Param("search") String search,
                                   Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM Invoice i WHERE i.status = 'PAID' AND i.issuedAt >= :from AND i.issuedAt <= :to")
    java.math.BigDecimal sumPaidInvoices(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
