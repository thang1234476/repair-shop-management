package com.repairshop.repository;
import com.repairshop.entity.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuoteItemRepository extends JpaRepository<QuoteItem, Integer> {
    List<QuoteItem> findByQuoteQuoteId(Integer quoteId);
}
