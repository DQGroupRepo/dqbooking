package com.booking.mapper;

import com.booking.dto.booking.BookingResponse;
import com.booking.model.Booking;
import com.booking.model.VendorService;


public interface BookingMapper {

    BookingResponse toResponse(
            Booking booking
    );


    BookingResponse toResponse(
            Booking booking,
            VendorService vendorService
    );

}