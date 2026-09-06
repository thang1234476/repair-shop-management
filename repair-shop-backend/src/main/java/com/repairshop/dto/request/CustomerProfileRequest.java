package com.repairshop.dto.request;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private String gender; // MALE, FEMALE, OTHER
    private String note;
}
