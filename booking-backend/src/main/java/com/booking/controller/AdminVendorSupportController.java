package com.booking.controller;

import com.booking.model.VendorSupportSession;
import com.booking.service.VendorSupportService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vendor-support")
@RequiredArgsConstructor
public class AdminVendorSupportController {


    private final VendorSupportService
            vendorSupportService;


    /*
     * =========================================
     * START SUPPORT MODE
     * =========================================
     */

    @PostMapping("/{vendorId}/start")
    public VendorSupportSession startSupport(
            @PathVariable String vendorId
    ) {

        return vendorSupportService
                .startSupport(
                        vendorId
                );
    }


    /*
     * =========================================
     * CURRENT SUPPORT SESSION
     * =========================================
     */

    @GetMapping("/current")
    public VendorSupportSession getCurrentSupport() {

        return vendorSupportService
                .getCurrentSupport();
    }


    /*
     * =========================================
     * END SUPPORT MODE
     * =========================================
     */

    @PostMapping("/end")
    public void endSupport() {

        vendorSupportService
                .endSupport();
    }

}