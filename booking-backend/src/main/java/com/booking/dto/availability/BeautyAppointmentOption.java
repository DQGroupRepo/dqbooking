package com.booking.dto.availability;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalTime;
@Getter @Builder
public class BeautyAppointmentOption {
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private boolean available;
    private Integer remainingCapacity;
}
