package com.booking.service.impl;

import com.booking.dto.revenue.MonthlyRevenueResponse;
import com.booking.dto.revenue.PaymentHistoryResponse;
import com.booking.dto.revenue.RevenueSummaryResponse;
import com.booking.model.Booking;
import com.booking.model.User;
import com.booking.repository.BookingRepository;
import com.booking.service.RevenueService;
import com.booking.service.VendorAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

    private final BookingRepository bookingRepository;

    private final VendorAccessService vendorAccessService;

    @Override
    public RevenueSummaryResponse getSummary() {

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        List<Booking> bookings =
                bookingRepository.findByVendorId(vendorId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal pendingPayments = BigDecimal.ZERO;
        BigDecimal thisMonth = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();

        for (Booking booking : bookings) {

            BigDecimal total =
                    booking.getTotalAmount() == null
                            ? BigDecimal.ZERO
                            : booking.getTotalAmount();

            BigDecimal paid =
                    booking.getPaidAmount() == null
                            ? BigDecimal.ZERO
                            : booking.getPaidAmount();

            totalRevenue = totalRevenue.add(total);

            pendingPayments =
                    pendingPayments.add(total.subtract(paid));

            if (booking.getEventDate() != null
                    && booking.getEventDate().getMonth() == today.getMonth()
                    && booking.getEventDate().getYear() == today.getYear()) {

                thisMonth = thisMonth.add(total);

            }

        }

        BigDecimal average =
                bookings.isEmpty()
                        ? BigDecimal.ZERO
                        : totalRevenue
                        .divide(
                                BigDecimal.valueOf(bookings.size()),
                                2,
                                RoundingMode.HALF_UP
                        );

        return RevenueSummaryResponse.builder()
                .thisMonth(thisMonth)
                .totalRevenue(totalRevenue)
                .pendingPayments(pendingPayments)
                .averageBookingValue(average)
                .build();

    }

    @Override
    public List<MonthlyRevenueResponse> getMonthlyRevenue() {

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        List<Booking> bookings =
                bookingRepository.findByVendorId(vendorId);

        return List.of(Month.values()).stream()
                .map(month -> {

                    BigDecimal revenue = bookings.stream()
                            .filter(b -> b.getEventDate() != null)
                            .filter(b -> b.getEventDate().getMonth() == month)
                            .map(b -> b.getTotalAmount() == null
                                    ? BigDecimal.ZERO
                                    : b.getTotalAmount())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return MonthlyRevenueResponse.builder()
                            .month(month.getDisplayName(
                                    TextStyle.SHORT,
                                    Locale.ENGLISH))
                            .revenue(revenue)
                            .build();

                })
                .toList();

    }

    @Override
    public List<PaymentHistoryResponse> getPaymentHistory() {

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        return bookingRepository
                .findTop5ByVendorIdOrderByCreatedTsDesc(
                        vendorId)
                .stream()
                .map(this::mapPayment)
                .toList();

    }

    private PaymentHistoryResponse mapPayment(
            Booking booking) {

        return PaymentHistoryResponse.builder()
                .bookingNumber(booking.getBookingNumber())
                .customerName(booking.getCustomerName())
                .serviceName(booking.getServiceName())
                .totalAmount(booking.getTotalAmount())
                .paidAmount(booking.getPaidAmount())
                .paymentStatus(booking.getPaymentStatus())
                .eventDate(booking.getEventDate())
                .build();

    }

}