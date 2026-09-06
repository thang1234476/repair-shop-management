package com.repairshop.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Integer ticketId;
    private String ticketCode;
    private Integer customerId;
    private String customerName;
    private Integer deviceId;
    private String deviceType;
    private String deviceBrand;
    private String deviceModel;
    private Integer staffId;
    private String staffName;
    private String status;
    private String issueDescription;
    private String diagnosisNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private String qrCodeBase64; // Base64 encoded QR image
}
