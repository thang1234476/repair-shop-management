package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class CreateQuoteRequest {
    @NotNull @Size(min=1) private List<QuoteItemRequest> items;
}
