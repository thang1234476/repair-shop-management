package com.repairshop.service;
import com.repairshop.dto.request.StaffRequest;
import com.repairshop.dto.request.CustomerProfileRequest;
import com.repairshop.dto.response.StaffResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StaffService {
    StaffResponse createStaff(StaffRequest request);
    Page<StaffResponse> getAllStaff(Pageable pageable);
    StaffResponse getStaff(Integer staffId);
    StaffResponse updateStaff(Integer staffId, StaffRequest request);
    StaffResponse lockUnlockStaff(Integer staffId);
    StaffResponse updatePosition(Integer staffId, String position);
    StaffResponse getStaffProfile(Integer staffId);
    StaffResponse updateStaffProfile(Integer staffId, CustomerProfileRequest request);
}
