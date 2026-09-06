package com.repairshop.repository;
import com.repairshop.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Integer> {
    List<Device> findByCustomerCustomerId(Integer customerId);
}
