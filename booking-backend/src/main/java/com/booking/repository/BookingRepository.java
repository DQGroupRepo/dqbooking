package com.booking.repository;

import com.booking.model.Booking;
import com.booking.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByVendorId(String vendorId);

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByVendorIdAndStatus(
            String vendorId,
            BookingStatus status
    );

    List<Booking> findByVendorIdAndEventDateBetween(
            String vendorId,
            LocalDate start,
            LocalDate end
    );

    List<Booking> findTop5ByVendorIdOrderByCreatedAtDesc(
            String vendorId
    );

    List<Booking> findByServiceId(String serviceId);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(
            String customerId
    );

}