package com.booking.exception;

public class VendorNotFoundException extends ResourceNotFoundException {

    public VendorNotFoundException(String userId) {
        super("Vendor not found for user : " + userId);
    }

}