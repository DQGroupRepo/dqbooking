package com.booking.exception;

public class VendorServiceNotFoundException extends ResourceNotFoundException {

    public VendorServiceNotFoundException(String serviceId) {
        super("Vendor service not found : " + serviceId);
    }

}