package com.booking.controller;

import com.booking.dto.vendor.BankDetailsRequest;
import com.booking.dto.vendor.BankDetailsResponse;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("vendor/settings")
public class VendorSettingsController {


    @PostMapping("/bankdetails")
    public BankDetailsResponse insertBankDetails(
            @PathVariable String serviceId,
            @Valid @RequestBody BankDetailsRequest request) {

       VendorServiceResponse response =
                //vendorOfferingService.createService(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

}
