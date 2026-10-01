package com.booking.service;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.vendor.BankDetailsRequest;
import com.booking.dto.vendor.BankDetailsResponse;

public interface BankDetailsService {

    BankDetailsResponse insertBankDetails(
            String serviceId,
            BankDetailsRequest request
    );

}
