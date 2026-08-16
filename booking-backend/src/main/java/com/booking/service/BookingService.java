package com.booking.service;

import com.booking.dto.booking.*;

import java.util.List;

public interface BookingService {

    BookingGroupResponse createBooking(
            CreateBookingRequest request
    );

    List<BookingResponse> getVendorBookings();

    List<BookingResponse> getCustomerBookings();

    List<BookingResponse> getServiceBookings(String serviceId);

    CustomerBookingDetailsResponse getBookingDetails(
            String bookingId
    );

    BookingCancellationResponse cancelBooking(
            String bookingId
    );

    CancellationPreviewResponse getCancellationPreview(
            String bookingId
    );

    BookingGroupResponse getBookingGroup(
            String bookingGroupId
    );
}