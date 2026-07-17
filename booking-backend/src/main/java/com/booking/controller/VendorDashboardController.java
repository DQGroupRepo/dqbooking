package com.booking.controller;

import com.booking.dto.vendorservice.DashboardResponse;
import com.booking.service.VendorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/dashboard")
@RequiredArgsConstructor
public class VendorDashboardController {

    private final VendorDashboardService vendorDashboardService;

    @GetMapping
    public DashboardResponse getDashboard() {

        return vendorDashboardService.getDashboard();

    }

}