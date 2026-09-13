package com.booking.repository;

import com.booking.model.AvailabilityOverride;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailabilityOverrideRepository
        extends MongoRepository<AvailabilityOverride, String> {

    List<AvailabilityOverride> findByServiceIdAndDateOrderByCreatedTsAsc(
            String serviceId,
            LocalDate date
    );

    Optional<AvailabilityOverride>
    findByServiceIdAndSlotIdAndDate(
            String serviceId,
            String slotId,
            LocalDate date
    );

    boolean existsByServiceIdAndSlotIdAndDate(
            String serviceId,
            String slotId,
            LocalDate date
    );
}