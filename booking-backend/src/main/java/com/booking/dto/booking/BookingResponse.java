package com.booking.dto.booking;

import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class BookingResponse {

    private String id;

    private String bookingNumber;

    private String serviceName;

    private BigDecimal totalAmount;

    private LocalDate eventDate;

    private Integer guestCount;

    private BookingStatus status;

    private PaymentStatus paymentStatus;

    private String specialRequest;

    private String eventType;
}