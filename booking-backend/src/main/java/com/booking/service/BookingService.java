package com.booking.service;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.booking.CreateBookingRequest;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    BookingResponse getBooking(String bookingId);

    List<BookingResponse> getVendorBookings();

    List<BookingResponse> getCustomerBookings();

    List<BookingResponse> getServiceBookings(String serviceId);

}