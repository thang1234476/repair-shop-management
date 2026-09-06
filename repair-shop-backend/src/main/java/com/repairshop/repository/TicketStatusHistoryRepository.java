package com.repairshop.repository;
import com.repairshop.entity.TicketStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, Integer> {
    List<TicketStatusHistory> findByTicketTicketIdOrderByChangedAtAsc(Integer ticketId);
}
