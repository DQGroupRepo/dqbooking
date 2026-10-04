package com.booking.service;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.dto.customer.VendorPricingForDateResponse;
import com.booking.model.VendorServicePricing;

import java.time.LocalDate;
import java.util.List;

public interface CustomerService {
    VendorDetailResponse getServiceById(
            String serviceId
    );

    List<VendorListingResponse> getVendorListings(String category);

    List<VendorListingResponse> getFeaturedServices();

    List<VendorListingResponse> getPopularHalls();

    List<VendorListingResponse> getTopBridalMakeup();

    List<VendorListingResponse> getProfessionalPhotography();

    List<VendorListingResponse> getWeddingVideography();

    VendorPricingForDateResponse getPricingForEventDate(
            String serviceId, LocalDate eventDate);
}
