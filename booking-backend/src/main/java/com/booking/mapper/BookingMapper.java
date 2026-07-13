package com.booking.mapper;

import com.booking.dto.booking.BookingResponse;
import com.booking.model.Booking;

public interface BookingMapper {

    BookingResponse toResponse(Booking booking);

}