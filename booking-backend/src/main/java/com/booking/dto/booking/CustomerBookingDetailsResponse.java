package com.booking.dto.booking;

import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.dto.pricing.PricingHeadSnapshot;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class CustomerBookingDetailsResponse {

    private String bookingId;

    private String bookingNumber;

    private String serviceId;

    private String serviceName;

    private String vendorId;

    private String vendorName;

    private String vendorPhone;

    private String vendorEmail;

    private LocalDate bookingDate;

    private LocalDate eventDate;

    private Integer guestCount;

    private String eventType;

    private String specialRequest;

    private BookingStatus bookingStatus;

    private PaymentStatus paymentStatus;

    private BigDecimal baseAmount;

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal totalAmount;

    private BigDecimal advanceAmount;

    private BigDecimal balanceAmount;

    private BigDecimal paidAmount;

    private List<PricingHeadSnapshot> pricingHeads;

    private List<DiscountSnapshot> discounts;

}