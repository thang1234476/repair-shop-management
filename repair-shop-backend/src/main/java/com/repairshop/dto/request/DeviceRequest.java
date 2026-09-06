package com.repairshop.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DeviceRequest {
    @NotBlank @Size(max=50) private String deviceType;
    @Size(max=50) private String brand;
    @Size(max=100) private String model;
    @Size(max=100) private String serialNumber;
    @Size(max=50) private String imei;
    private String initialCondition;
    private Integer customerId; // required when staff creates device
}
