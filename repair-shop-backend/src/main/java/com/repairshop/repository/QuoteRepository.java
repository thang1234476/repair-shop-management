package com.repairshop.repository;
import com.repairshop.entity.Quote;
import com.repairshop.enums.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, Integer> {
    List<Quote> findByTicketTicketId(Integer ticketId);
    Optional<Quote> findByTicketTicketIdAndStatus(Integer ticketId, QuoteStatus status);
}
