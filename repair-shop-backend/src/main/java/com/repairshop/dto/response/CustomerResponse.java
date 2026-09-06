package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerResponse {
    private Integer customerId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String status;
    private String address;
    private LocalDate dateOfBirth;
    private String gender;
    private String note;
}
