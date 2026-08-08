package com.booking.service.impl;

import com.booking.dto.admin.AdminBookingResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.Booking;
import com.booking.repository.BookingRepository;
import com.booking.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminBookingServiceImpl
        implements AdminBookingService {

    private final BookingRepository bookingRepository;

    @Override
    public List<AdminBookingResponse> getBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AdminBookingResponse getBooking(
            String bookingId
    ) {

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                ));

        return toResponse(booking);
    }

    private AdminBookingResponse toResponse(
            Booking booking
    ) {

        return AdminBookingResponse.builder()

                .id(booking.getId())

                .bookingNumber(
                        booking.getBookingNumber()
                )

                .customerId(
                        booking.getCustomerId()
                )

                .customerName(
                        booking.getCustomerName()
                )

                .customerEmail(
                        booking.getCustomerEmail()
                )

                .vendorId(
                        booking.getVendorId()
                )

                .serviceId(
                        booking.getServiceId()
                )

                .serviceName(
                        booking.getServiceName()
                )

                .eventDate(
                        booking.getEventDate() != null
                                ? booking.getEventDate().toString()
                                : null
                )

                .guestCount(
                        booking.getGuestCount()
                )

                .eventType(
                        booking.getEventType()
                )

                .status(
                        booking.getStatus()
                )

                .paymentStatus(
                        booking.getPaymentStatus()
                )

                .totalAmount(
                        booking.getTotalAmount()
                )

                .paidAmount(
                        booking.getPaidAmount()
                )

                .createdAt(
                        booking.getCreatedAt() != null
                                ? booking.getCreatedAt().toString()
                                : null
                )

                .build();
    }
}