package com.booking.dto.admin;

import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class AdminBookingResponse {

    private String id;

    private String bookingNumber;

    private String customerId;

    private String customerName;

    private String customerEmail;

    private String vendorId;

    private String serviceId;

    private String serviceName;

    private String eventDate;

    private Integer guestCount;

    private String eventType;

    private BookingStatus status;

    private PaymentStatus paymentStatus;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private String createdAt;
}