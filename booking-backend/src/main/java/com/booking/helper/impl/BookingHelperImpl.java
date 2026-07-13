package com.booking.helper.impl;

import com.booking.helper.BookingHelper;
import com.booking.model.Booking;
import com.booking.model.VendorService;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import org.springframework.stereotype.Component;

@Component
public class BookingHelperImpl implements BookingHelper {

    @Override
    public void prepareBooking(Booking booking,
                               VendorService vendorService) {

        booking.setVendorId(vendorService.getVendorId());

        booking.setServiceId(vendorService.getId());

        /*
         * Snapshot values.
         * These should never change after booking.
         */
        booking.setServiceName(vendorService.getServiceName());

        booking.setTotalAmount(vendorService.getPrice());

        booking.setStatus(BookingStatus.PENDING);

        booking.setPaymentStatus(PaymentStatus.PENDING);

    }
}