package com.booking.controller;

import com.booking.dto.vendorservice.DashboardResponse;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.repository.VendorRepository;
import com.booking.service.VendorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorRepository vendorRepository;
    private final VendorDashboardService vendorDashboardService;

    @GetMapping("/profile")
    public Vendor profile(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return vendorRepository.findByUserId(user.getId())
                .orElse(null);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                vendorDashboardService.getDashboard()
        );
    }

}