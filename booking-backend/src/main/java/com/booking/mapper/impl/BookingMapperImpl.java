package com.booking.mapper.impl;

import com.booking.dto.booking.BookingResponse;
import com.booking.mapper.BookingMapper;
import com.booking.model.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapperImpl implements BookingMapper {

    @Override
    public BookingResponse toResponse(Booking booking) {

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .serviceName(booking.getServiceName())
                .totalAmount(booking.getTotalAmount())
                .eventDate(booking.getEventDate())
                .guestCount(booking.getGuestCount())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .specialRequest(booking.getSpecialRequest())
                .eventType(booking.getEventType())
                .customerName(booking.getCustomerName())

                .customerPhone(booking.getCustomerPhone())

                .customerEmail(booking.getCustomerEmail())

                .venue(booking.getVenue())

                .paidAmount(booking.getPaidAmount())
                .build();
    }
}