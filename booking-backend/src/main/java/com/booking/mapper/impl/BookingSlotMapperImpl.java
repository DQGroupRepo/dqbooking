package com.booking.mapper.impl;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotRequest;
import com.booking.mapper.BookingSlotMapper;
import com.booking.model.BookingSlot;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingSlotMapperImpl implements BookingSlotMapper {

    @Override
    public BookingSlot toEntity(CreateBookingSlotRequest request) {

        BookingSlot bookingSlot = new BookingSlot();

        bookingSlot.setSlotName(request.getSlotName());
        bookingSlot.setStartTime(request.getStartTime());
        bookingSlot.setEndTime(request.getEndTime());
        bookingSlot.setMaxBookings(request.getMaxBookings());
        bookingSlot.setDisplayOrder(request.getDisplayOrder());

        return bookingSlot;
    }

    @Override
    public BookingSlotResponse toResponse(BookingSlot bookingSlot) {

        BookingSlotResponse response = new BookingSlotResponse();

        response.setId(bookingSlot.getId());
        response.setServiceId(bookingSlot.getServiceId());

        response.setSlotName(bookingSlot.getSlotName());

        response.setStartTime(bookingSlot.getStartTime());
        response.setEndTime(bookingSlot.getEndTime());

        response.setMaxBookings(bookingSlot.getMaxBookings());
        response.setDisplayOrder(bookingSlot.getDisplayOrder());

        response.setActive(bookingSlot.getActive());

        response.setCreatedAt(bookingSlot.getCreatedTs());
        response.setUpdatedAt(bookingSlot.getLastUpdateTs());

        return response;
    }

    @Override
    public List<BookingSlotResponse> toResponseList(List<BookingSlot> bookingSlots) {

        return bookingSlots
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void updateEntity(
            BookingSlot bookingSlot,
            UpdateBookingSlotRequest request) {

        bookingSlot.setSlotName(request.getSlotName());

        bookingSlot.setStartTime(request.getStartTime());
        bookingSlot.setEndTime(request.getEndTime());

        bookingSlot.setMaxBookings(request.getMaxBookings());
        bookingSlot.setDisplayOrder(request.getDisplayOrder());
    }

}