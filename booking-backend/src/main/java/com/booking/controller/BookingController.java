package com.booking.controller;

import com.booking.dto.booking.*;
import com.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request) {

        return bookingService.createBooking(request);
    }

    @GetMapping("/{bookingId}")
    public BookingResponse getBooking(
            @PathVariable String bookingId) {

        return bookingService.getBooking(bookingId);
    }

    @GetMapping("/vendor")
    public List<BookingResponse> getVendorBookings() {

        return bookingService.getVendorBookings();
    }

    @GetMapping("/customer")
    public List<BookingResponse> getCustomerBookings() {

        return bookingService.getCustomerBookings();
    }

    @PatchMapping("/{bookingId}/cancel")
    public BookingCancellationResponse cancelBooking(
            @PathVariable String bookingId
    ) {

        return bookingService.cancelBooking(
                bookingId
        );

    }

    @GetMapping("/{bookingId}/details")
    public CustomerBookingDetailsResponse getBookingDetails(
            @PathVariable String bookingId
    ) {

        return bookingService.getBookingDetails(
                bookingId);

    }

    @GetMapping("/{bookingId}/cancellation-preview")
    public CancellationPreviewResponse getCancellationPreview(

            @PathVariable String bookingId

    ) {

        return bookingService.getCancellationPreview(
                bookingId
        );

    }

}