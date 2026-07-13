package com.booking.model;

import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Document(collection = "bookings")
public class Booking extends BaseEntity {

    private String bookingNumber;

    private String vendorId;

    private String customerId;

    private String serviceId;

    /*
     * Snapshot fields.
     * Preserve booking history even if the service changes later.
     */
    private String serviceName;

    private BigDecimal totalAmount;

    private LocalDate eventDate;

    private Integer guestCount;

    private BookingStatus status = BookingStatus.PENDING;

    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String specialRequest;

    private String eventType;
}