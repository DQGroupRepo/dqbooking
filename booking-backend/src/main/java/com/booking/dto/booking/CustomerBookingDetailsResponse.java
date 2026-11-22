package com.booking.dto.booking;

import com.booking.model.embedded.BookingDiscountSnapshot;
import com.booking.model.embedded.BookingPricingHeadSnapshot;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    /** True only when the authenticated vendor may cancel this vendor-created booking. */
    private Boolean vendorCanCancel;

    private LocalDate bookingDate;

    private LocalDateTime bookingFrom;

    private LocalDateTime bookingTo;

    private String serviceCategory;

    private String bookingType;

    private Integer roomQuantity;

    private String slotId;

    private String slotName;

    private String slotStartTime;

    private String slotEndTime;

    private String resourceTypeName;

    private List<String> resourceIds;

    private List<String> resourceNames;

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

    private String packageId;
    private String packageName;
    private BigDecimal packagePrice;
    private List<String> packageFeatures;

    private List<BookingPricingHeadSnapshot> pricingHeads;

    private List<BookingDiscountSnapshot> discounts;

    private LocalDateTime cancelledAt;

    private Integer refundPercentage;

    private BigDecimal cancellationCharge;

    private BigDecimal refundableAmount;

    private Integer refundProcessingDays;
}