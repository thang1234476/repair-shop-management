package com.repairshop.service;
import com.repairshop.dto.request.DeviceRequest;
import com.repairshop.dto.response.DeviceResponse;
import java.util.List;

public interface DeviceService {
    DeviceResponse createDevice(DeviceRequest request, Integer customerId);
    DeviceResponse createDeviceForCustomer(DeviceRequest request);
    DeviceResponse updateDevice(Integer deviceId, DeviceRequest request, Integer currentUserId);
    List<DeviceResponse> getCustomerDevices(Integer customerId);
    DeviceResponse getDevice(Integer deviceId);
    List<com.repairshop.dto.response.TicketResponse> getDeviceRepairHistory(Integer deviceId);
}
