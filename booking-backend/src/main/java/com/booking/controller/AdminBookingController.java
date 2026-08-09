package com.booking.controller;

import com.booking.dto.admin.AdminBookingResponse;
import com.booking.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public List<AdminBookingResponse> getBookings() {

        return adminBookingService.getBookings();
    }

    @GetMapping("/{bookingId}")
    public AdminBookingResponse getBooking(
            @PathVariable String bookingId
    ) {

        return adminBookingService.getBooking(
                bookingId
        );
    }
}