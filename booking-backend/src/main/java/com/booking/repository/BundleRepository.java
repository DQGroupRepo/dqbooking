package com.booking.repository;

import com.booking.model.Bundle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BundleRepository
        extends MongoRepository<Bundle, String> {

    List<Bundle> findByVendorIdAndActiveTrue(
            String vendorId
    );

    List<Bundle> findByVendorId(
            String vendorId
    );

    Optional<Bundle> findByIdAndVendorId(
            String bundleId,
            String vendorId
    );

    List<Bundle> findByServiceIdsContainingAndActiveTrue(
            String serviceId
    );

}