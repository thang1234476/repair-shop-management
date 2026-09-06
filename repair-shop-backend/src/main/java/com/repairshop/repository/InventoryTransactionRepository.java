package com.repairshop.repository;
import com.repairshop.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {
    Page<InventoryTransaction> findByPartPartId(Integer partId, Pageable pageable);
    Page<InventoryTransaction> findByRelatedTicketTicketId(Integer ticketId, Pageable pageable);
}
