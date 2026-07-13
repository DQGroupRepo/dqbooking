package com.booking.exception;

public class BookingNotFoundException extends ResourceNotFoundException {

    public BookingNotFoundException(String bookingId) {
        super("Booking not found with id: " + bookingId);
    }

}