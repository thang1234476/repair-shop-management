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
import java.util.List;
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

    /**
     * Group paid invoices by date and sum finalAmount per day.
     * Returns Object[] rows: [0] = date string (YYYY-MM-DD), [1] = BigDecimal revenue
     */
    @Query(value =
        "SELECT CAST(i.issued_at AS DATE) AS revenue_date, " +
        "       COALESCE(SUM(i.final_amount), 0) AS revenue " +
        "FROM invoices i " +
        "WHERE i.status = 'PAID' " +
        "  AND i.issued_at >= :from " +
        "  AND i.issued_at <= :to " +
        "GROUP BY CAST(i.issued_at AS DATE) " +
        "ORDER BY revenue_date ASC",
        nativeQuery = true)
    List<Object[]> getRevenueByDay(@Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to);
}
