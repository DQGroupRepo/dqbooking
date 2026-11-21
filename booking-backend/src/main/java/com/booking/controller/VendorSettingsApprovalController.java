package com.booking.controller;

import com.booking.dto.settings.VendorSettingsChangeSubmission;
import com.booking.model.VendorSettingsChangeRequest;
import com.booking.service.VendorSettingsApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/settings-approval")
@RequiredArgsConstructor
public class VendorSettingsApprovalController {
    private final VendorSettingsApprovalService service;

    @PostMapping("/submit")
    public ResponseEntity<Void> submit(@RequestBody VendorSettingsChangeSubmission request) {
        service.submit(request);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/mine")
    public List<VendorSettingsChangeRequest> mine() { return service.getOwnRequests(); }
}
