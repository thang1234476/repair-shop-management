package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=3, max=50) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=8) private String password;
    @NotBlank @Size(max=100) private String fullName;
    @Pattern(regexp="^[0-9+\\-\\s]*$") private String phone;
}
