package com.repairshop.service.impl;

import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.response.StaffResponse;
import com.repairshop.entity.Staff;
import com.repairshop.entity.User;
import com.repairshop.enums.Role;
import com.repairshop.enums.StaffPosition;
import com.repairshop.enums.UserStatus;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.StaffRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {
    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public StaffResponse createStaff(StaffRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BadRequestException("Username already exists");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already exists");

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(Role.STAFF);
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        Staff staff = new Staff();
        staff.setUser(user);
        staff.setPosition(StaffPosition.valueOf(request.getPosition()));
        staff.setSpecialty(request.getSpecialty());
        if (request.getHireDate() != null) staff.setHireDate(LocalDate.parse(request.getHireDate()));
        staff = staffRepository.save(staff);

        return mapToResponse(staff);
    }

    @Override
    public Page<StaffResponse> getAllStaff(Pageable pageable) {
        return staffRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public StaffResponse getStaff(Integer staffId) {
        return mapToResponse(staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found")));
    }

    @Override
    @Transactional
    public StaffResponse updateStaff(Integer staffId, StaffRequest request) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        User user = staff.getUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPosition() != null) staff.setPosition(StaffPosition.valueOf(request.getPosition()));
        if (request.getSpecialty() != null) staff.setSpecialty(request.getSpecialty());
        userRepository.save(user);
        return mapToResponse(staffRepository.save(staff));
    }

    @Override
    @Transactional
    public StaffResponse lockUnlockStaff(Integer staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        User user = staff.getUser();
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE);
        userRepository.save(user);
        return mapToResponse(staff);
    }

    @Override
    @Transactional
    public StaffResponse updatePosition(Integer staffId, String position) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        staff.setPosition(StaffPosition.valueOf(position));
        return mapToResponse(staffRepository.save(staff));
    }

    @Override
    public StaffResponse getStaffProfile(Integer staffId) {
        return getStaff(staffId);
    }

    @Override
    @Transactional
    public StaffResponse updateStaffProfile(Integer staffId, CustomerProfileRequest request) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        User user = staff.getUser();
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);
        return mapToResponse(staff);
    }

    private StaffResponse mapToResponse(Staff staff) {
        StaffResponse r = new StaffResponse();
        r.setStaffId(staff.getStaffId());
        if (staff.getUser() != null) {
            r.setUsername(staff.getUser().getUsername());
            r.setEmail(staff.getUser().getEmail());
            r.setFullName(staff.getUser().getFullName());
            r.setPhone(staff.getUser().getPhone());
            r.setStatus(staff.getUser().getStatus().name());
        }
        r.setPosition(staff.getPosition().name());
        r.setSpecialty(staff.getSpecialty());
        r.setHireDate(staff.getHireDate());
        return r;
    }
}
