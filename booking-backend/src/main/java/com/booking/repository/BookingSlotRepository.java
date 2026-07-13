package com.booking.repository;

import com.booking.model.BookingSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingSlotRepository extends MongoRepository<BookingSlot, String> {

    /**
     * Get all slots of a Vendor Service.
     */
    List<BookingSlot> findByServiceId(String serviceId);

    /**
     * Get active slots ordered by display order.
     */
    List<BookingSlot> findByServiceIdOrderByDisplayOrderAsc(String serviceId);

    /**
     * Find slot by name within a service.
     */
    Optional<BookingSlot> findByServiceIdAndSlotNameIgnoreCase(
            String serviceId,
            String slotName
    );

    /**
     * Check duplicate slot names.
     */
    boolean existsByServiceIdAndSlotNameIgnoreCase(
            String serviceId,
            String slotName
    );

}