package com.booking.helper.impl;

import com.booking.helper.BookingHelper;
import com.booking.model.Booking;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.model.VendorService;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BookingHelperImpl implements BookingHelper {

    @Override
    public void prepareBooking(
            Booking booking,
            VendorService vendorService,
            User customer,
            Vendor vendor
    ) {

        booking.setVendorId(vendorService.getVendorId());

        booking.setServiceId(vendorService.getId());

        /*
         * Service snapshot.
         */
        booking.setServiceName(
                vendorService.getServiceName()
        );

        /*
         * Customer snapshot.
         */
        booking.setCustomerName(
                customer.getFullName()
        );

        booking.setCustomerPhone(
                customer.getPhone()
        );

        booking.setCustomerEmail(
                customer.getEmail()
        );

        /*
         * Venue snapshot.
         */
        booking.setVenue(
                vendor.getBusinessName()
        );

        /*
         * Payment snapshot.
         */
        booking.setPaidAmount(
                BigDecimal.ZERO
        );

        booking.setTotalAmount(
                vendorService.getPrice()
        );

        booking.setStatus(
                BookingStatus.PENDING
        );

        booking.setPaymentStatus(
                PaymentStatus.PENDING
        );

    }
}