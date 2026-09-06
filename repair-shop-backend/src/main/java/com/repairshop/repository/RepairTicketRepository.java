package com.repairshop.repository;
import com.repairshop.entity.RepairTicket;
import com.repairshop.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RepairTicketRepository extends JpaRepository<RepairTicket, Integer> {
    Optional<RepairTicket> findByTicketCode(String ticketCode);
    Page<RepairTicket> findByCustomerCustomerId(Integer customerId, Pageable pageable);
    Page<RepairTicket> findByCustomerCustomerIdAndStatus(Integer customerId, TicketStatus status, Pageable pageable);
    Page<RepairTicket> findByStaffStaffId(Integer staffId, Pageable pageable);
    
    @Query("SELECT t FROM RepairTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:staffId IS NULL OR t.staff.staffId = :staffId) AND " +
           "(:from IS NULL OR t.createdAt >= :from) AND " +
           "(:to IS NULL OR t.createdAt <= :to) AND " +
           "(:search IS NULL OR LOWER(t.ticketCode) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(t.customer.user.fullName) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<RepairTicket> findWithFilters(@Param("status") TicketStatus status,
                                       @Param("staffId") Integer staffId,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to,
                                       @Param("search") String search,
                                       Pageable pageable);
    
    long countByStatus(TicketStatus status);
    
    @Query("SELECT COUNT(t) FROM RepairTicket t WHERE t.createdAt >= :from AND t.createdAt <= :to")
    long countByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
