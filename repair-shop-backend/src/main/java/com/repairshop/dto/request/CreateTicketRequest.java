package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotNull private Integer customerId;
    @NotNull private Integer deviceId;
    private Integer staffId;
    private String issueDescription;
}
