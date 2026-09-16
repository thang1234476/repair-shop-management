package com.repairshop.service.impl;

import com.repairshop.dto.request.CreateCustomerRequest;
import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.response.CustomerProfileResponse;
import com.repairshop.dto.response.CustomerResponse;
import com.repairshop.entity.Customer;
import com.repairshop.entity.User;
import com.repairshop.enums.Gender;
import com.repairshop.enums.Role;
import com.repairshop.enums.UserStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user = userRepository.save(user);

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setAddress(request.getAddress());
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                customer.setGender(Gender.valueOf(request.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setGender(null);
            }
        }
        customer.setNote(request.getNote());
        customer = customerRepository.save(customer);

        return mapToResponse(customer);
    }

    @Override
    public CustomerProfileResponse getCustomerProfile(Integer userId) {
        Customer customer = customerRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        User user = customer.getUser();
        CustomerProfileResponse r = new CustomerProfileResponse();
        r.setCustomerId(customer.getCustomerId());
        if (user != null) {
            r.setUsername(user.getUsername());
            r.setEmail(user.getEmail());
            r.setFullName(user.getFullName());
            r.setPhone(user.getPhone());
        }
        r.setAddress(customer.getAddress());
        r.setDateOfBirth(customer.getDateOfBirth());
        r.setGender(customer.getGender());
        r.setNote(customer.getNote());
        return r;
    }

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
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                customer.setGender(Gender.valueOf(request.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setGender(null);
            }
        }
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
