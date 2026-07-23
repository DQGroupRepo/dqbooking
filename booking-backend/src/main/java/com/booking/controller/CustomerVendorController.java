package com.booking.controller.customer;

import com.booking.dto.customer.VendorListingResponse;
import com.booking.service.CustomerVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class CustomerVendorController {

    private final CustomerVendorService customerVendorService;

    @GetMapping
    public List<VendorListingResponse> getListings() {

        return customerVendorService.getListings();

    }

}