package com.booking.exception;

public class ReviewAlreadyExistsException
        extends RuntimeException {

    public ReviewAlreadyExistsException(
            String bookingId
    ) {

        super("Review already exists for booking: " + bookingId);

    }

}