package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    @NotBlank private String status;
    private String note;
}
