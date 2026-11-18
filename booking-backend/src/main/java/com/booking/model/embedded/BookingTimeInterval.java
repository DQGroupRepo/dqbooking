package com.booking.model.embedded;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Exact occupancy interval; intervals use half-open [from,to) semantics. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingTimeInterval {
    private LocalDateTime from;
    private LocalDateTime to;
}
