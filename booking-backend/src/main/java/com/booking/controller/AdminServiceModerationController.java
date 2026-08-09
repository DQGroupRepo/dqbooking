package com.booking.controller;

import com.booking.service.AdminServiceModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
public class AdminServiceModerationController {

    private final AdminServiceModerationService
            adminServiceModerationService;

    @PutMapping("/{serviceId}/approve")
    public ResponseEntity<Void> approveService(
            @PathVariable String serviceId
    ) {

        adminServiceModerationService
                .approveService(serviceId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{serviceId}/reject")
    public ResponseEntity<Void> rejectService(
            @PathVariable String serviceId
    ) {

        adminServiceModerationService
                .rejectService(serviceId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{serviceId}/suspend")
    public ResponseEntity<Void> suspendService(
            @PathVariable String serviceId
    ) {

        adminServiceModerationService
                .suspendService(serviceId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{serviceId}/reactivate")
    public ResponseEntity<Void> reactivateService(
            @PathVariable String serviceId
    ) {

        adminServiceModerationService
                .reactivateService(serviceId);

        return ResponseEntity.ok().build();
    }
}