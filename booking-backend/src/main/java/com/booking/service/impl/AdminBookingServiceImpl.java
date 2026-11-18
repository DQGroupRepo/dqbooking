package com.booking.service.impl;

import com.booking.dto.admin.AdminBookingResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.Booking;
import com.booking.repository.BookingRepository;
import com.booking.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminBookingServiceImpl
        implements AdminBookingService {

    private static final Logger log =
            LoggerFactory.getLogger(AdminBookingServiceImpl.class);

    private final BookingRepository bookingRepository;

    @Override
    public List<AdminBookingResponse> getBookings() {

        log.info("Admin requested all bookings");

        List<AdminBookingResponse> bookings =
                bookingRepository
                        .findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        log.info(
                "Admin booking list retrieved count={}",
                bookings.size()
        );

        return bookings;
    }

    @Override
    public AdminBookingResponse getBooking(
            String bookingId
    ) {

        log.info(
                "Admin requested booking bookingId={}",
                bookingId
        );

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Admin requested non-existent booking bookingId={}",
                                    bookingId
                            );

                            return new ResourceNotFoundException(
                                    "Booking not found"
                            );
                        });

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

                .bookingFrom(booking.getBookingFrom())
                .bookingTo(booking.getBookingTo())

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
                        booking.getCreatedTs() != null
                                ? booking.getCreatedTs().toString()
                                : null
                )

                .build();
    }
}