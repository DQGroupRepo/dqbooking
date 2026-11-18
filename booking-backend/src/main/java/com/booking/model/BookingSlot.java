package com.booking.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookingSlots")
public class BookingSlot extends BaseEntity {

    private String serviceId;

    /** Optional resource type assignment; null keeps legacy slot capacity. */
    private String resourceTypeId;

    /** DAILY_RECURRING reserves the slot window each selected day; CONTINUOUS reserves the whole stay. */
    private String bookingPattern = "DAILY_RECURRING";

    private String slotName;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer maxBookings;

    private Boolean allowOverlap;

    private Integer displayOrder;

}