package com.repairshop.service.impl;

import com.repairshop.dto.request.DeviceRequest;
import com.repairshop.dto.response.DeviceResponse;
import com.repairshop.dto.response.TicketResponse;
import com.repairshop.entity.Customer;
import com.repairshop.entity.Device;
import com.repairshop.exception.BadRequestException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.CustomerRepository;
import com.repairshop.repository.DeviceRepository;
import com.repairshop.service.DeviceService;
import com.repairshop.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final CustomerRepository customerRepository;
    private final TicketService ticketService;

    @Override
    @Transactional
    public DeviceResponse createDevice(DeviceRequest request, Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Device device = new Device();
        device.setCustomer(customer);
        device.setDeviceType(request.getDeviceType());
        device.setBrand(request.getBrand());
        device.setModel(request.getModel());
        device.setSerialNumber(request.getSerialNumber());
        device.setImei(request.getImei());
        device.setInitialCondition(request.getInitialCondition());
        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    @Transactional
    public DeviceResponse createDeviceForCustomer(DeviceRequest request) {
        if (request.getCustomerId() == null) throw new BadRequestException("customerId is required");
        return createDevice(request, request.getCustomerId());
    }

    @Override
    @Transactional
    public DeviceResponse updateDevice(Integer deviceId, DeviceRequest request, Integer currentUserId) {
        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        if (request.getDeviceType() != null) device.setDeviceType(request.getDeviceType());
        if (request.getBrand() != null) device.setBrand(request.getBrand());
        if (request.getModel() != null) device.setModel(request.getModel());
        if (request.getSerialNumber() != null) device.setSerialNumber(request.getSerialNumber());
        if (request.getImei() != null) device.setImei(request.getImei());
        if (request.getInitialCondition() != null) device.setInitialCondition(request.getInitialCondition());
        return mapToResponse(deviceRepository.save(device));
    }

    @Override
    public List<DeviceResponse> getCustomerDevices(Integer customerId) {
        return deviceRepository.findByCustomerCustomerId(customerId).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public DeviceResponse getDevice(Integer deviceId) {
        return mapToResponse(deviceRepository.findById(deviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Device not found")));
    }

    @Override
    public List<TicketResponse> getDeviceRepairHistory(Integer deviceId) {
        return ticketService.getTicketsByDeviceId(deviceId);
    }

    private DeviceResponse mapToResponse(Device d) {
        DeviceResponse r = new DeviceResponse();
        r.setDeviceId(d.getDeviceId());
        if (d.getCustomer() != null) {
            r.setCustomerId(d.getCustomer().getCustomerId());
            if (d.getCustomer().getUser() != null) r.setCustomerName(d.getCustomer().getUser().getFullName());
        }
        r.setDeviceType(d.getDeviceType());
        r.setBrand(d.getBrand());
        r.setModel(d.getModel());
        r.setSerialNumber(d.getSerialNumber());
        r.setImei(d.getImei());
        r.setInitialCondition(d.getInitialCondition());
        r.setCreatedAt(d.getCreatedAt());
        return r;
    }
}
