package com.booking.repository;

import com.booking.model.VendorCateringMenu;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorCateringMenuRepository
        extends MongoRepository<VendorCateringMenu, String> {

    Optional<VendorCateringMenu>
    findByServiceId(String serviceId);

    Optional<VendorCateringMenu>
    findByServiceIdAndVendorId(
            String serviceId,
            String vendorId
    );

    boolean existsByServiceId(String serviceId);

    void deleteByServiceIdAndVendorId(
            String serviceId,
            String vendorId
    );

}