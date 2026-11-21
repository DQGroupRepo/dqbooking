package com.booking.controller;

import com.booking.dto.settings.VendorSettingsDecisionRequest;
import com.booking.model.VendorSettingsChangeRequest;
import com.booking.service.VendorSettingsApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/vendors/{vendorId}/settings-approval")
@RequiredArgsConstructor
public class AdminVendorSettingsApprovalController {
    private final VendorSettingsApprovalService service;

    @GetMapping
    public List<VendorSettingsChangeRequest> pending(@PathVariable String vendorId) {
        return service.getPending(vendorId);
    }

    @PostMapping("/decision")
    public ResponseEntity<Void> decide(@PathVariable String vendorId, @RequestBody VendorSettingsDecisionRequest request) {
        service.decide(vendorId, request);
        return ResponseEntity.ok().build();
    }
}
