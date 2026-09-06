package com.repairshop.service.impl;

import com.repairshop.dto.request.CreatePartRequest;
import com.repairshop.dto.request.InventoryExportRequest;
import com.repairshop.dto.request.InventoryImportRequest;
import com.repairshop.dto.response.InventoryTransactionResponse;
import com.repairshop.dto.response.PartResponse;
import com.repairshop.entity.InventoryTransaction;
import com.repairshop.entity.Part;
import com.repairshop.entity.RepairTicket;
import com.repairshop.entity.User;
import com.repairshop.enums.InventoryTransactionType;
import com.repairshop.exception.InsufficientStockException;
import com.repairshop.exception.ResourceNotFoundException;
import com.repairshop.repository.InventoryTransactionRepository;
import com.repairshop.repository.PartRepository;
import com.repairshop.repository.RepairTicketRepository;
import com.repairshop.repository.UserRepository;
import com.repairshop.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    private final PartRepository partRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final RepairTicketRepository ticketRepository;

    @Override
    @Transactional
    public InventoryTransactionResponse importParts(InventoryImportRequest request, Integer performedById) {
        Part part = partRepository.findById(request.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part not found"));
        User user = userRepository.findById(performedById)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        part.setQuantityInStock(part.getQuantityInStock() + request.getQuantity());
        partRepository.save(part);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setPart(part);
        tx.setType(InventoryTransactionType.IN);
        tx.setQuantity(request.getQuantity());
        tx.setPerformedBy(user);
        tx.setNote(request.getNote());
        return mapTxToResponse(transactionRepository.save(tx));
    }

    @Override
    @Transactional
    public InventoryTransactionResponse exportParts(InventoryExportRequest request, Integer performedById) {
        Part part = partRepository.findById(request.getPartId())
            .orElseThrow(() -> new ResourceNotFoundException("Part not found"));
        if (part.getQuantityInStock() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock. Available: " + part.getQuantityInStock());
        }
        User user = userRepository.findById(performedById)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        RepairTicket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        part.setQuantityInStock(part.getQuantityInStock() - request.getQuantity());
        partRepository.save(part);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setPart(part);
        tx.setType(InventoryTransactionType.OUT);
        tx.setQuantity(request.getQuantity());
        tx.setRelatedTicket(ticket);
        tx.setPerformedBy(user);
        tx.setNote(request.getNote());
        return mapTxToResponse(transactionRepository.save(tx));
    }

    @Override
    public Page<PartResponse> getAllParts(String search, Pageable pageable) {
        if (search == null || search.isBlank()) {
            return partRepository.findAll(pageable).map(this::mapPartToResponse);
        }
        return partRepository.searchParts(search, pageable).map(this::mapPartToResponse);
    }

    @Override
    public PartResponse getPartById(Integer partId) {
        return mapPartToResponse(partRepository.findById(partId)
            .orElseThrow(() -> new ResourceNotFoundException("Part not found")));
    }

    @Override
    @Transactional
    public PartResponse createPart(CreatePartRequest request) {
        if (partRepository.existsByPartCode(request.getPartCode()))
            throw new com.repairshop.exception.BadRequestException("Part code already exists");
        Part part = new Part();
        part.setPartCode(request.getPartCode());
        part.setPartName(request.getPartName());
        part.setUnit(request.getUnit() != null ? request.getUnit() : "cái");
        part.setUnitPrice(request.getUnitPrice());
        part.setQuantityInStock(request.getQuantityInStock());
        part.setMinStockThreshold(request.getMinStockThreshold() != null ? request.getMinStockThreshold() : 5);
        part.setSupplier(request.getSupplier());
        return mapPartToResponse(partRepository.save(part));
    }

    @Override
    @Transactional
    public PartResponse updatePart(Integer partId, CreatePartRequest request) {
        Part part = partRepository.findById(partId)
            .orElseThrow(() -> new ResourceNotFoundException("Part not found"));
        if (request.getPartName() != null) part.setPartName(request.getPartName());
        if (request.getUnitPrice() != null) part.setUnitPrice(request.getUnitPrice());
        if (request.getQuantityInStock() != null) part.setQuantityInStock(request.getQuantityInStock());
        if (request.getMinStockThreshold() != null) part.setMinStockThreshold(request.getMinStockThreshold());
        if (request.getSupplier() != null) part.setSupplier(request.getSupplier());
        return mapPartToResponse(partRepository.save(part));
    }

    @Override
    public List<PartResponse> getLowStockParts() {
        return partRepository.findLowStockParts().stream().map(this::mapPartToResponse).collect(Collectors.toList());
    }

    @Override
    public Page<InventoryTransactionResponse> getTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::mapTxToResponse);
    }

    private PartResponse mapPartToResponse(Part p) {
        PartResponse r = new PartResponse();
        r.setPartId(p.getPartId());
        r.setPartCode(p.getPartCode());
        r.setPartName(p.getPartName());
        r.setUnit(p.getUnit());
        r.setUnitPrice(p.getUnitPrice());
        r.setQuantityInStock(p.getQuantityInStock());
        r.setMinStockThreshold(p.getMinStockThreshold());
        r.setSupplier(p.getSupplier());
        r.setLowStock(p.getMinStockThreshold() != null && p.getQuantityInStock() <= p.getMinStockThreshold());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }

    private InventoryTransactionResponse mapTxToResponse(InventoryTransaction tx) {
        InventoryTransactionResponse r = new InventoryTransactionResponse();
        r.setTransactionId(tx.getTransactionId());
        if (tx.getPart() != null) {
            r.setPartId(tx.getPart().getPartId());
            r.setPartName(tx.getPart().getPartName());
        }
        r.setType(tx.getType().name());
        r.setQuantity(tx.getQuantity());
        if (tx.getRelatedTicket() != null) {
            r.setRelatedTicketId(tx.getRelatedTicket().getTicketId());
            r.setRelatedTicketCode(tx.getRelatedTicket().getTicketCode());
        }
        if (tx.getPerformedBy() != null) r.setPerformedBy(tx.getPerformedBy().getFullName());
        r.setTransactionDate(tx.getTransactionDate());
        r.setNote(tx.getNote());
        return r;
    }
}
