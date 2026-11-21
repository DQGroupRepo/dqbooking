package com.booking.repository;

import com.booking.model.VendorSettingsChangeRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VendorSettingsChangeRequestRepository extends MongoRepository<VendorSettingsChangeRequest, String> {
    List<VendorSettingsChangeRequest> findByVendorIdOrderBySubmittedAtDesc(String vendorId);
}
