package com.booking.dto.revenue;

import com.booking.model.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentHistoryResponse {

    private String bookingNumber;

    private String customerName;

    private String serviceName;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private PaymentStatus paymentStatus;

    private LocalDateTime bookingFrom;

    private LocalDateTime bookingTo;

}
