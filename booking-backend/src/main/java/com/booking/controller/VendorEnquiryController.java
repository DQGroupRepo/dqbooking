package com.booking.controller;

import com.booking.dto.vendorenquiry.CreateVendorEnquiryRequest;
import com.booking.dto.vendorenquiry.VendorEnquiryResponse;
import com.booking.service.VendorEnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/enquiries")
@RequiredArgsConstructor
public class VendorEnquiryController {

    private final VendorEnquiryService vendorEnquiryService;

    @PostMapping
    public ResponseEntity<VendorEnquiryResponse> createEnquiry(
            @Valid @RequestBody CreateVendorEnquiryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vendorEnquiryService.createEnquiry(request));
    }

    @GetMapping
    public ResponseEntity<List<VendorEnquiryResponse>> getEnquiries(
            @RequestParam LocalDate eventDate
    ) {
        return ResponseEntity.ok(
                vendorEnquiryService.getEnquiriesForDate(eventDate)
        );
    }
}
