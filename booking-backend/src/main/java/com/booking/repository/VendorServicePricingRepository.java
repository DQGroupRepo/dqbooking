package com.booking.repository;

import com.booking.model.VendorServicePricing;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendorServicePricingRepository
        extends MongoRepository<VendorServicePricing, String> {

   List<VendorServicePricing> findByServiceIdOrderByVersionDesc(
            String serviceId
    );

    Optional<VendorServicePricing>
    findTopByServiceIdAndEffectiveFromLessThanEqualAndActiveTrueOrderByVersionDesc(
            String serviceId,
            LocalDate eventDate
    );

    Optional<VendorServicePricing>
    findTopByServiceIdOrderByVersionDesc(
            String serviceId
    );
}