package com.repairshop.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCustomerRequest {
    @NotBlank
    @Size(min=3,max=50)
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min=8)
    private String password;
    
    @NotBlank
    private String fullName;
    
    private String phone;
    private String address;
    private String gender;
    private String note;
}
