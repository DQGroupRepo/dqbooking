package com.booking.service;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotRequest;

import java.util.List;

public interface BookingSlotService {

    BookingSlotResponse createSlot(
            String serviceId,
            CreateBookingSlotRequest request
    );

    BookingSlotResponse updateSlot(
            String slotId,
            UpdateBookingSlotRequest request
    );

    void deleteSlot(String slotId);

    BookingSlotResponse getSlot(String slotId);

    List<BookingSlotResponse> getSlots(String serviceId);

    BookingSlotResponse changeStatus(
            String slotId,
            Boolean active
    );
}