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

    private String slotName;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer maxBookings;

    private Boolean allowOverlap;

    private Integer displayOrder;

}