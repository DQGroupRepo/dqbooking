package com.booking.repository;

import com.booking.model.VendorService;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface VendorServiceRepository extends MongoRepository<VendorService, String> {

    List<VendorService> findByVendorIdAndDeletedFalse(String vendorId);

    List<VendorService> findByVendorIdAndActiveTrueAndDeletedFalse(String vendorId);

    Optional<VendorService> findByIdAndVendorIdAndDeletedFalse(
            String id,
            String vendorId
    );

    Optional<VendorService> findByIdAndActiveTrueAndDeletedFalse(
            String id
    );
}