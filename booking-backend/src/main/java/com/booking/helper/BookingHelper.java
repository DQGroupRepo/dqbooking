package com.booking.helper;

import com.booking.model.Booking;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.model.VendorService;

public interface BookingHelper {

    void prepareBooking(
            Booking booking,
            VendorService vendorService,
            User customer,
            Vendor vendor
    );

}