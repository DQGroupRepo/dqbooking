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


    /*
     * =========================================
     * CREATE BOOKING GROUP
     * =========================================
     *
     * Handles all checkout scenarios:
     *
     * - Single service
     * - Multiple services
     * - Bundle
     * - Mixed bundle + normal services
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingGroupResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request
    ) {

        return bookingService.createBooking(
                request
        );
    }


    /*
     * =========================================
     * GET BOOKING
     * =========================================
     */

    @GetMapping("/{bookingId}")
    public BookingResponse getBooking(
            @PathVariable String bookingId
    ) {

        return bookingService.getBooking(
                bookingId
        );
    }


    /*
     * =========================================
     * VENDOR BOOKINGS
     * =========================================
     */

    @GetMapping("/vendor")
    public List<BookingResponse> getVendorBookings() {

        return bookingService.getVendorBookings();
    }


    /*
     * =========================================
     * CUSTOMER BOOKINGS
     * =========================================
     */

    @GetMapping("/customer")
    public List<BookingResponse> getCustomerBookings() {

        return bookingService.getCustomerBookings();
    }


    /*
     * =========================================
     * CANCEL BOOKING
     * =========================================
     */

    @PatchMapping("/{bookingId}/cancel")
    public BookingCancellationResponse cancelBooking(
            @PathVariable String bookingId
    ) {

        return bookingService.cancelBooking(
                bookingId
        );
    }


    /*
     * =========================================
     * BOOKING DETAILS
     * =========================================
     */

    @GetMapping("/{bookingId}/details")
    public CustomerBookingDetailsResponse getBookingDetails(
            @PathVariable String bookingId
    ) {

        return bookingService.getBookingDetails(
                bookingId
        );
    }


    /*
     * =========================================
     * CANCELLATION PREVIEW
     * =========================================
     */

    @GetMapping("/{bookingId}/cancellation-preview")
    public CancellationPreviewResponse getCancellationPreview(
            @PathVariable String bookingId
    ) {

        return bookingService.getCancellationPreview(
                bookingId
        );
    }

}
