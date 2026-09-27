package com.booking.repository;

import com.booking.model.VendorUserPermission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorUserPermissionRepository
        extends MongoRepository<VendorUserPermission, String> {

    Optional<VendorUserPermission>
    findByUserId(String userId);

    Optional<VendorUserPermission>
    findByUserIdAndVendorId(
            String userId,
            String vendorId
    );

    void deleteByUserId(String userId);
}