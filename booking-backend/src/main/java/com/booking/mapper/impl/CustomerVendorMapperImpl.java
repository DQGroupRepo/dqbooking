package com.booking.mapper.impl;

import com.booking.dto.customer.VendorDetailResponse;
import com.booking.dto.customer.VendorListingResponse;
import com.booking.mapper.CustomerVendorMapper;
import com.booking.mapper.ServiceDetailSectionMapper;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.repository.ReviewRepository;
import com.booking.repository.VendorServicePricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;


@Component
@RequiredArgsConstructor
@Slf4j
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

                // A listing belongs to a specific service. Prefer the location
                // configured on that service; the vendor profile city is only a
                // fallback for older listings without a service location.
                .city(
                        service.getLocation() != null
                                && !service.getLocation().isBlank()
                                ? service.getLocation()
                                : vendor.getCity()
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

                .facilities(
                        service.getFacilities() == null ? List.of() : service.getFacilities()
                )

                .amenities(
                        service.getAmenities() == null ? List.of() : service.getAmenities()
                )

                .isActive(
                        service.getActive()
                )

                .build();
    }


    @Override
    public VendorDetailResponse toDetail(
            User vendor,
            VendorService service,
            VendorServicePricing pricing
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

        List<ServicePackage> packages =
                getPackages(pricing);

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

                .facilities(
                        service.getFacilities() == null ? List.of() : service.getFacilities()
                )

                .amenities(
                        service.getAmenities() == null ? List.of() : service.getAmenities()
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
                .packages(packages)
                .resourceTypes(service.getResourceTypes())
                .beautyDetails(service.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP ? service.getBeautyDetails() : null)

                .build();
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

    private List<ServicePackage> getPackages(
            VendorServicePricing pricing
    ) {

        if (pricing == null ||
                pricing.getPackages() == null) {

            return Collections.emptyList();
        }

        return pricing.getPackages();
    }
}