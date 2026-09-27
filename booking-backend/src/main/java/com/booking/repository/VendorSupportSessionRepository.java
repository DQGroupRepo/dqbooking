package com.booking.repository;

import com.booking.model.VendorSupportSession;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorSupportSessionRepository
        extends MongoRepository<VendorSupportSession, String> {

    Optional<VendorSupportSession>
    findByAdminIdAndActiveTrue(
            String adminId
    );

}