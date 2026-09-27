package com.booking.repository;

import com.booking.model.VendorAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorAccountRepository
        extends MongoRepository<VendorAccount, String> {

    Optional<VendorAccount> findByVendorAdminId(
            String vendorAdminId
    );
}