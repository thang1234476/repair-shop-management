package com.repairshop.service.impl;

import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.response.CustomerResponse;
import com.repairshop.entity.Customer;
import com.repairshop.entity.User;
import com.repairshop.enums.Gender;
import com.repairshop.enums.UserStatus;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CustomerResponse updateProfile(Integer userId, CustomerProfileRequest request) {
        Customer customer = customerRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        User user = customer.getUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) customer.setAddress(request.getAddress());
        if (request.getDateOfBirth() != null) customer.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) customer.setGender(Gender.valueOf(request.getGender()));
        if (request.getNote() != null) customer.setNote(request.getNote());
        userRepository.save(user);
        customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Override
    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return customerRepository.findAll(pageable).map(this::mapToResponse);
        }
        return customerRepository.searchCustomers(search, pageable).map(this::mapToResponse);
    }

    @Override
    public CustomerResponse getCustomer(Integer customerId) {
        return mapToResponse(customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found")));
    }

    @Override
    @Transactional
    public void lockUnlockCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        User user = customer.getUser();
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public CustomerResponse getCustomerWithHistory(Integer customerId) {
        return getCustomer(customerId);
    }

    private CustomerResponse mapToResponse(Customer c) {
        CustomerResponse r = new CustomerResponse();
        r.setCustomerId(c.getCustomerId());
        if (c.getUser() != null) {
            r.setUsername(c.getUser().getUsername());
            r.setEmail(c.getUser().getEmail());
            r.setFullName(c.getUser().getFullName());
            r.setPhone(c.getUser().getPhone());
            r.setStatus(c.getUser().getStatus().name());
        }
        r.setAddress(c.getAddress());
        r.setDateOfBirth(c.getDateOfBirth());
        r.setGender(c.getGender() != null ? c.getGender().name() : null);
        r.setNote(c.getNote());
        return r;
    }
}
