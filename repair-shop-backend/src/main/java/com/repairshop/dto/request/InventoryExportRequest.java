package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InventoryExportRequest {
    @NotNull private Integer partId;
    @NotNull @Min(1) private Integer quantity;
    @NotNull private Integer ticketId;
    private String note;
}
