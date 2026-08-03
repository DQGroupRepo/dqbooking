package com.booking.dto.booking;

import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class CustomerBookingSummaryResponse {

    private String bookingId;

    private String bookingNumber;

    private String serviceId;

    private String serviceName;

    private String vendorName;

    private String serviceImage;

    private LocalDate eventDate;

    private Integer guestCount;

    private BigDecimal totalAmount;

    private BigDecimal advanceAmount;

    private BigDecimal paidAmount;

    private BookingStatus bookingStatus;

    private PaymentStatus paymentStatus;

}