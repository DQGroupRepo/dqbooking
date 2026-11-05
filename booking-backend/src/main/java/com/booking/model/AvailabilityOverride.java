package com.booking.model;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "availabilityOverrides")
public class AvailabilityOverride extends BaseEntity {

    private String serviceId;

    /** Booking slot whose inventory is overridden. */
    private String slotId;

    /** Deprecated legacy field; new overrides always leave this null. */
    private String roomTypeId;

    private LocalDate date;

    /**
     * true = vendor blocked this slot
     */
    private Boolean blocked;

    /**
     * Optional capacity override that caps BookingSlot.maxBookings.
     * Null = use the normal capacity.
     */
    private Integer capacityOverride;

    /**
     * Optional reason shown only to vendor.
     */
    private String reason;

}