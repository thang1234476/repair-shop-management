package com.repairshop.repository;
import com.repairshop.entity.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Integer> {
    Optional<Part> findByPartCode(String partCode);
    boolean existsByPartCode(String partCode);
    
    @Query("SELECT p FROM Part p WHERE " +
           "LOWER(p.partName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "LOWER(p.partCode) LIKE LOWER(CONCAT('%',:search,'%'))")
    Page<Part> searchParts(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT p FROM Part p WHERE p.quantityInStock <= p.minStockThreshold")
    List<Part> findLowStockParts();
}
