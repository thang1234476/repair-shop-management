package com.repairshop.repository;
import com.repairshop.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    @Query("SELECT c FROM Customer c JOIN c.user u WHERE " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%',:search,'%')) OR " +
           "u.phone LIKE CONCAT('%',:search,'%') OR " +
           "u.email LIKE LOWER(CONCAT('%',:search,'%'))")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);
}
