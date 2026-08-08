package com.booking.service;

import com.booking.dto.admin.AdminBookingResponse;

import java.util.List;

public interface AdminBookingService {

    List<AdminBookingResponse> getBookings();

    AdminBookingResponse getBooking(String bookingId);
}