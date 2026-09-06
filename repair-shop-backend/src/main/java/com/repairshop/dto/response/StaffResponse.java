package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StaffResponse {
    private Integer staffId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String status;
    private String position;
    private String specialty;
    private LocalDate hireDate;
}
