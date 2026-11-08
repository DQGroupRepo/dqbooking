package com.booking.dto.availability;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import com.booking.model.embedded.BookingTimeInterval;

@Getter
@Setter
public class CreateBookingHoldRequest {
    @NotBlank
    private String serviceId;

    /** Required for STAY and for all other slot-based bookings. */
    private String slotId;

    /** Required for package-aware holds; omitted by legacy callers for compatibility. */
    private String packageId;

    private String resourceTypeId;

    @NotNull
    private LocalDateTime bookingFrom;

    @NotNull
    private LocalDateTime bookingTo;

    /** Exact occupied intervals; required for DAILY_RECURRING multi-day slots. */
    private List<BookingTimeInterval> bookingIntervals;

    private String bookingType = "STANDARD_SLOT";
    @Min(1)
    private Integer roomQuantity = 1;

    @NotNull
    @Min(1)
    private Integer quantity = 1;

    @NotBlank
    private String cartId;
}
