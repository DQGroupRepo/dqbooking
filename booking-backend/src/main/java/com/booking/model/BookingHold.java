package com.booking.model;

import com.booking.model.enums.BookingHoldStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "booking_holds")
public class BookingHold extends BaseEntity {

    private String serviceId;

    private String slotId;

    private LocalDate eventDate;

    private String customerId;

    private String cartId;

    private Integer quantity;

    private BookingHoldStatus status = BookingHoldStatus.ACTIVE;

    /*
     * Hold is valid only until this timestamp.
     */
    @Indexed
    private LocalDateTime expiresAt;

    /*
     * Filled when the hold becomes part of
     * a successfully created booking.
     */
    private String bookingGroupId;

    private LocalDateTime releasedAt;
}