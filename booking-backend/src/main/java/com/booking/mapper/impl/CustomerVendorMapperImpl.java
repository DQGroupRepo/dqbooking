package com.booking.mapper.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.model.Vendor;
import com.booking.model.VendorService;
import org.springframework.stereotype.Component;

@Component
public class CustomerVendorMapperImpl
        implements CustomerVendorMapper {

    @Override
    public VendorListingResponse toListing(
            Vendor vendor,
            VendorService service
    ) {

        return VendorListingResponse.builder()
                .serviceId(service.getId())
                .businessName(vendor.getBusinessName())
                .description(service.getDescription())
                .category(service.getCategory().name())
                .city(vendor.getCity())
                .startingPrice(service.getPrice())
                .rating(vendor.getRating())
                .reviewCount(vendor.getTotalReviews())
                .capacity(service.getCapacity())
                .imageUrl(
                        service.getImageUrls() != null &&
                                !service.getImageUrls().isEmpty()
                                ? service.getImageUrls().get(0)
                                : null
                )
                .gallery(service.getImageUrls())
                .amenities(service.getAmenities())
                .isActive(service.getActive())
                .build();

    }

    @Override
    public VendorDetailResponse toDetail(
            Vendor vendor,
            VendorService service
    ) {

        return VendorDetailResponse.builder()

                .serviceId(service.getId())

                .vendorId(vendor.getId())

                .businessName(vendor.getBusinessName())

                .serviceName(service.getServiceName())

                .description(service.getDescription())

                .category(service.getCategory().name())

                .city(vendor.getCity())

                .startingPrice(service.getPrice())

                .rating(vendor.getRating())

                .reviewCount(vendor.getTotalReviews())

                .capacity(service.getCapacity())

                .imageUrls(service.getImageUrls())

                .amenities(service.getAmenities())

                .attributes(service.getAttributes())

                .contactInfo(service.getContactInfo())

                .bookingSettings(service.getBookingSettings())

                .availability(service.getAvailability())

                .location(service.getLocation())

                .build();

    }

}