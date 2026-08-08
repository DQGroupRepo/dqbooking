package com.booking.controller;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/services/{serviceId}")
    public VendorDetailResponse getService(

            @PathVariable String serviceId

    ) {

        return customerService.getServiceById(
                serviceId
        );

    }

    @GetMapping("/services")
    public List<VendorListingResponse> getServices(

            @RequestParam(required = false)
            String category

    ) throws Exception {

        return customerService.getVendorListings(category);

    }
}
