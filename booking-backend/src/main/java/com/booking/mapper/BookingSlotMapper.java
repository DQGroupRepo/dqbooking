package com.booking.mapper;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotRequest;
import com.booking.model.BookingSlot;

import java.util.List;

public interface BookingSlotMapper {

    BookingSlot toEntity(CreateBookingSlotRequest request);

    BookingSlotResponse toResponse(BookingSlot bookingSlot);

    List<BookingSlotResponse> toResponseList(List<BookingSlot> bookingSlots);

    void updateEntity(
            BookingSlot bookingSlot,
            UpdateBookingSlotRequest request
    );

}