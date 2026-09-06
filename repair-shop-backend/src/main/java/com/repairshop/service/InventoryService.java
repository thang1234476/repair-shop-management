package com.repairshop.service;
import com.repairshop.dto.request.*;
import com.repairshop.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface InventoryService {
    InventoryTransactionResponse importParts(InventoryImportRequest request, Integer performedById);
    InventoryTransactionResponse exportParts(InventoryExportRequest request, Integer performedById);
    Page<PartResponse> getAllParts(String search, Pageable pageable);
    PartResponse getPartById(Integer partId);
    PartResponse createPart(CreatePartRequest request);
    PartResponse updatePart(Integer partId, CreatePartRequest request);
    List<PartResponse> getLowStockParts();
    Page<InventoryTransactionResponse> getTransactions(Pageable pageable);
}
