package com.booking.controller;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.dto.customer.VendorPricingForDateResponse;
import com.booking.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

        return customerService.getVendorListings(
                category
        );

    }


    /*
     * =========================================
     * FEATURED
     * =========================================
     */

    @GetMapping("/services/featured")
    public List<VendorListingResponse> getFeaturedServices() {

        return customerService.getFeaturedServices();

    }


    /*
     * =========================================
     * POPULAR HALLS
     * =========================================
     */

    @GetMapping("/services/popular-halls")
    public List<VendorListingResponse> getPopularHalls() {

        return customerService.getPopularHalls();

    }


    /*
     * =========================================
     * TOP BRIDAL MAKEUP
     * =========================================
     */

    @GetMapping("/services/top-bridal-makeup")
    public List<VendorListingResponse> getTopBridalMakeup() {

        return customerService.getTopBridalMakeup();

    }


    /*
     * =========================================
     * PROFESSIONAL PHOTOGRAPHY
     * =========================================
     */

    @GetMapping("/services/professional-photography")
    public List<VendorListingResponse> getProfessionalPhotography() {

        return customerService.getProfessionalPhotography();

    }


    /*
     * =========================================
     * WEDDING VIDEOGRAPHY
     * =========================================
     */

    @GetMapping("/services/wedding-videography")
    public List<VendorListingResponse> getWeddingVideography() {

        return customerService.getWeddingVideography();

    }

    @GetMapping("/services/{serviceId}/pricing")
    public VendorPricingForDateResponse getPricingForDate(
            @PathVariable String serviceId,
            @RequestParam LocalDate eventDate
    ) {

        return customerService
                .getPricingForEventDate(
                        serviceId,
                        eventDate
                );
    }

}