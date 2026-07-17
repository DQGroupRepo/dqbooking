package com.booking.exception;

public class ReviewNotAllowedException
        extends RuntimeException {

    public ReviewNotAllowedException(
            String message
    ) {

        super(message);

    }

}