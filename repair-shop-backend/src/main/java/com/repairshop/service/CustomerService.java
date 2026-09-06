package com.repairshop.service;
import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerResponse updateProfile(Integer userId, CustomerProfileRequest request);
    Page<CustomerResponse> getAllCustomers(String search, Pageable pageable);
    CustomerResponse getCustomer(Integer customerId);
    void lockUnlockCustomer(Integer customerId);
    CustomerResponse getCustomerWithHistory(Integer customerId);
}
