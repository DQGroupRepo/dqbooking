package com.booking.repository;

import com.booking.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface VendorRepository extends MongoRepository<Vendor, String> {

    Optional<Vendor> findByUserId(String userId);

    Optional<Vendor> findById(String id);
}