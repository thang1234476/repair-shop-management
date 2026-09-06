package com.repairshop.repository;
import com.repairshop.entity.Staff;
import com.repairshop.enums.StaffPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {
    List<Staff> findByPosition(StaffPosition position);
}
