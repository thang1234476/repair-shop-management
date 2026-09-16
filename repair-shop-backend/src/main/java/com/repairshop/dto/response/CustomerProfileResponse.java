package com.repairshop.dto.response;

import com.repairshop.enums.Gender;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerProfileResponse {
    private Integer customerId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String note;
}
