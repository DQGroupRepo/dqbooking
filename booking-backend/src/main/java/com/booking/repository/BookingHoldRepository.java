package com.booking.repository;

import com.booking.model.BookingHold;
import com.booking.model.enums.BookingHoldStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingHoldRepository
        extends MongoRepository<BookingHold, String> {

    List<BookingHold> findByServiceIdAndSlotIdAndEventDateAndStatus(
            String serviceId,
            String slotId,
            LocalDate eventDate,
            BookingHoldStatus status
    );

    List<BookingHold> findByServiceIdAndSlotIdAndEventDateAndStatusAndExpiresAtAfter(
            String serviceId,
            String slotId,
            LocalDate eventDate,
            BookingHoldStatus status,
            LocalDateTime expiresAt
    );

    Optional<BookingHold> findByIdAndStatus(
            String holdId,
            BookingHoldStatus status
    );

    List<BookingHold> findByStatusAndExpiresAtBefore(
            BookingHoldStatus status,
            LocalDateTime expiresAt
    );

    List<BookingHold> findByCartIdAndStatus(
            String cartId,
            BookingHoldStatus status
    );
}