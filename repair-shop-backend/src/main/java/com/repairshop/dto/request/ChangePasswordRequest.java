package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank private String oldPassword;
    @NotBlank @Size(min=8) private String newPassword;
}
