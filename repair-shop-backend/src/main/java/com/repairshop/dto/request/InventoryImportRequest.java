package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InventoryImportRequest {
    @NotNull private Integer partId;
    @NotNull @Min(1) private Integer quantity;
    private String note;
}
