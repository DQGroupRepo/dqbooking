package com.booking.controller;

import com.booking.dto.admin.AdminVendorVerificationResponse;
import com.booking.model.enums.ServiceDiscoveryTag;
import com.booking.service.AdminVendorVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
public class AdminVendorVerificationController {

    private final AdminVendorVerificationService
            adminVendorVerificationService;

    @GetMapping
    public ResponseEntity<
            List<AdminVendorVerificationResponse>
            > getVendors() {

        return ResponseEntity.ok(
                adminVendorVerificationService
                        .getVendors()
        );
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<
            AdminVendorVerificationResponse
            > getVendor(
            @PathVariable String vendorId
    ) {

        return ResponseEntity.ok(
                adminVendorVerificationService
                        .getVendor(vendorId)
        );
    }

    @PutMapping("/{vendorId}/approve")
    public ResponseEntity<Void> approveVendor(
            @PathVariable String vendorId
    ) {

        adminVendorVerificationService
                .approveVendor(vendorId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{vendorId}/reject")
    public ResponseEntity<Void> rejectVendor(
            @PathVariable String vendorId
    ) {

        adminVendorVerificationService
                .rejectVendor(vendorId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{vendorId}/suspend")
    public ResponseEntity<Void> suspendVendor(
            @PathVariable String vendorId
    ) {

        adminVendorVerificationService
                .suspendVendor(vendorId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{vendorId}/reactivate")
    public ResponseEntity<Void> reactivateVendor(
            @PathVariable String vendorId
    ) {

        adminVendorVerificationService
                .reactivateVendor(vendorId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/services/{serviceId}/discovery-tags")
    public ResponseEntity<Void> updateServiceDiscoveryTags(

            @PathVariable String serviceId,

            @RequestBody Set<ServiceDiscoveryTag> tags

    ) {

        adminVendorVerificationService
                .updateServiceDiscoveryTags(
                        serviceId,
                        tags
                );

        return ResponseEntity.ok().build();
    }
}