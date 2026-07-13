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

    private String slotId;

    private LocalDate date;

    /**
     * true = vendor blocked this slot
     */
    private Boolean blocked;

    /**
     * Optional capacity override.
     * Null = use BookingSlot.maxBookings
     */
    private Integer capacityOverride;

    /**
     * Optional reason shown only to vendor.
     */
    private String reason;

}