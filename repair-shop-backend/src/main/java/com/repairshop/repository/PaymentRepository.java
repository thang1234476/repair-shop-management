package com.repairshop.repository;
import com.repairshop.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByInvoiceInvoiceId(Integer invoiceId);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.invoiceId = :invoiceId")
    BigDecimal sumPaymentsByInvoice(@Param("invoiceId") Integer invoiceId);
}
