package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DeviceResponse {
    private Integer deviceId;
    private Integer customerId;
    private String customerName;
    private String deviceType;
    private String brand;
    private String model;
    private String serialNumber;
    private String imei;
    private String initialCondition;
    private LocalDateTime createdAt;
}
