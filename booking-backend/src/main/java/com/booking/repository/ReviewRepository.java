package com.booking.repository;

import com.booking.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository
        extends MongoRepository<Review, String> {

    List<Review> findByVendorIdAndDeletedFalse(String vendorId);

    List<Review> findByCustomerIdAndDeletedFalse(String customerId);

    Optional<Review> findByBookingId(String bookingId);

    List<Review> findByServiceId(String serviceId);

    long countByDeletedFalse();

    List<Review> findByVendorId(
            String vendorId
    );

    long countByVendorId(String vendorId);
}