package com.booking.repository;

import com.booking.model.BookingGroup;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookingGroupRepository
        extends MongoRepository<BookingGroup, String> {


    Optional<BookingGroup> findByBookingGroupId(
            String bookingGroupId
    );

    List<BookingGroup> findByCustomerId(
            String customerId
    );

}
