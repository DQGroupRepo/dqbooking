package com.booking.mapper.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.mapper.ServiceDetailSectionMapper;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.repository.ReviewRepository;
import com.booking.repository.VendorServicePricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomerVendorMapperImpl
        implements CustomerVendorMapper {

    private final ServiceDetailSectionMapper
            serviceDetailSectionMapper;

    private final ReviewRepository
            reviewRepository;

    private final VendorServicePricingRepository
            vendorServicePricingRepository;


    @Override
    public VendorListingResponse toListing(
            User vendor,
            VendorService service
    ) {

        List<Review> reviews =
                getVendorReviews(
                        vendor.getId()
                );

        double averageRating =
                calculateAverageRating(
                        reviews
                );

        int reviewCount =
                reviews.size();

        return VendorListingResponse.builder()

                .serviceId(
                        service.getId()
                )

                .serviceName(
                        service.getServiceName()
                )

                .businessName(
                        vendor.getBusinessName()
                )

                .description(
                        service.getDescription()
                )

                .category(
                        service.getCategory().name()
                )

                .city(
                        vendor.getCity()
                )

                .startingPrice(
                        service.getStartingPrice()
                )

                .rating(
                        averageRating
                )

                .reviewCount(
                        reviewCount
                )

                .capacity(
                        service.getCapacity()
                )

                .imageUrl(
                        service.getImageUrls() != null
                                && !service.getImageUrls().isEmpty()
                                ? service.getImageUrls().get(0)
                                : null
                )

                .gallery(
                        service.getImageUrls()
                )

                .amenities(
                        service.getAmenities()
                )

                .isActive(
                        service.getActive()
                )

                .build();
    }


    @Override
    public VendorDetailResponse toDetail(
            User vendor,
            VendorService service
    ) {

        List<Review> reviews =
                getVendorReviews(
                        vendor.getId()
                );

        double averageRating =
                calculateAverageRating(
                        reviews
                );

        int reviewCount =
                reviews.size();

        /*
         * Packages now belong to VendorServicePricing.
         *
         * For the customer service-detail view, retrieve
         * the latest/current pricing version.
         */
        List<com.booking.model.embedded.ServicePackage> packages =
                getCurrentPackages(
                        service.getId()
                );

        return VendorDetailResponse.builder()

                .serviceId(
                        service.getId()
                )

                .vendorId(
                        vendor.getId()
                )

                .businessName(
                        vendor.getBusinessName()
                )

                .serviceName(
                        service.getServiceName()
                )

                .description(
                        service.getDescription()
                )

                .category(
                        service.getCategory().name()
                )

                .city(
                        vendor.getCity()
                )

                .startingPrice(
                        service.getStartingPrice()
                )

                .rating(
                        averageRating
                )

                .reviewCount(
                        reviewCount
                )

                .capacity(
                        service.getCapacity()
                )

                .imageUrls(
                        service.getImageUrls()
                )

                .amenities(
                        service.getAmenities()
                )

                .detailSections(
                        serviceDetailSectionMapper
                                .toResponseList(
                                        service.getDetailSections()
                                )
                )

                .contactInfo(
                        service.getContactInfo()
                )

                .bookingSettings(
                        service.getBookingSettings()
                )

                .location(
                        service.getLocation()
                )

                .packages(
                        packages
                )

                .build();
    }


    private List<com.booking.model.embedded.ServicePackage>
    getCurrentPackages(
            String serviceId
    ) {

        return vendorServicePricingRepository
                .findByServiceIdOrderByVersionDesc(
                        serviceId
                )
                .stream()
                .findFirst()
                .map(VendorServicePricing::getPackages)
                .orElse(Collections.emptyList());
    }


    private List<Review> getVendorReviews(
            String vendorId
    ) {

        return reviewRepository
                .findByVendorIdAndDeletedFalse(
                        vendorId
                );
    }


    private double calculateAverageRating(
            List<Review> reviews
    ) {

        if (reviews == null || reviews.isEmpty()) {
            return 0.0;
        }

        return reviews.stream()
                .filter(
                        review ->
                                review.getRating() != null
                )
                .mapToInt(
                        Review::getRating
                )
                .average()
                .orElse(0.0);
    }
}