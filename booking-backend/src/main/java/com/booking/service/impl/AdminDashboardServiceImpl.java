package com.booking.service.impl;

import com.booking.dto.admin.AdminBookingTrendResponse;
import com.booking.dto.admin.AdminDashboardResponse;
import com.booking.dto.admin.AdminRecentBookingResponse;
import com.booking.dto.admin.AdminRevenueTrendResponse;
import com.booking.model.Booking;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.Role;
import com.booking.model.enums.UserStatus;
import com.booking.repository.BookingRepository;
import com.booking.repository.ReviewRepository;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.booking.dto.admin.AdminPendingActionsResponse;
import com.booking.model.enums.ServiceModerationStatus;
import com.booking.model.enums.VendorVerificationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl
        implements AdminDashboardService {

    private final UserRepository userRepository;

    private final BookingRepository bookingRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final ReviewRepository reviewRepository;


    @Override
    public AdminDashboardResponse getDashboard() {

        /*
         * =========================================
         * USER COUNTS
         * =========================================
         */

        long totalUsers =
                userRepository.count();

        long totalVendors =
                userRepository.countByRole(
                        Role.VENDOR
                );


        /*
         * =========================================
         * BOOKINGS
         * =========================================
         */

        List<Booking> allBookings =
                bookingRepository.findAll();

        long totalBookings =
                allBookings.size();


        long pendingBookings =
                allBookings.stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.PENDING
                        )
                        .count();


        long confirmedBookings =
                allBookings.stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.CONFIRMED
                        )
                        .count();


        long completedBookings =
                allBookings.stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.COMPLETED
                        )
                        .count();


        long cancelledBookings =
                allBookings.stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.CANCELLED
                        )
                        .count();


        /*
         * =========================================
         * REVENUE
         * =========================================
         */

        BigDecimal totalRevenue =
                allBookings.stream()

                        .map(Booking::getTotalAmount)

                        .filter(amount ->
                                amount != null
                        )

                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        /*
         * =========================================
         * ACTIVE PLATFORM USERS
         * =========================================
         */

        long activeCustomers =
                userRepository.countByRoleAndStatus(
                        Role.CUSTOMER,
                        UserStatus.ACTIVE
                );


        long activeVendors =
                userRepository.countByRoleAndStatus(
                        Role.VENDOR,
                        UserStatus.ACTIVE
                );


        /*
         * =========================================
         * ACTIVE SERVICES
         * =========================================
         */

        long activeServices =
                vendorServiceRepository
                        .findByActiveTrueAndDeletedFalse()
                        .size();


        /*
         * =========================================
         * REVIEWS
         * =========================================
         */

        long totalReviews =
                reviewRepository.countByDeletedFalse();


        /*
         * =========================================
         * RECENT BOOKINGS
         * =========================================
         */

        List<AdminRecentBookingResponse>
                recentBookings =

                bookingRepository
                        .findTop5ByOrderByCreatedAtDesc()

                        .stream()

                        .map(
                                this::toRecentBookingResponse
                        )

                        .toList();


        /*
         * =========================================
         * ANALYTICS
         * =========================================
         */

        LocalDateTime trendStart =
                LocalDateTime.now()
                        .minusMonths(6)
                        .withDayOfMonth(1)
                        .toLocalDate()
                        .atStartOfDay();


        List<AdminBookingTrendResponse>
                bookingTrend =
                bookingRepository
                        .findMonthlyBookingTrend(
                                trendStart
                        )
                        .stream()
                        .map(item ->
                                AdminBookingTrendResponse
                                        .builder()
                                        .period(
                                                item.getPeriod()
                                        )
                                        .bookings(
                                                item.getBookings()
                                        )
                                        .build()
                        )
                        .toList();


        List<AdminRevenueTrendResponse>
                revenueTrend =
                bookingRepository
                        .findMonthlyRevenueTrend(
                                trendStart
                        )
                        .stream()
                        .map(item ->
                                AdminRevenueTrendResponse
                                        .builder()
                                        .period(
                                                item.getPeriod()
                                        )
                                        .revenue(
                                                item.getRevenue()
                                        )
                                        .build()
                        )
                        .toList();

        /*
         * =========================================
         * PENDING ACTIONS
         * =========================================
         */

        long pendingVendorVerifications =
                userRepository.countByRoleAndVerificationStatus(
                        Role.VENDOR,
                        VendorVerificationStatus.PENDING
                );

        long pendingServiceModerations =
                vendorServiceRepository
                        .countByModerationStatusAndDeletedFalse(
                                ServiceModerationStatus.PENDING
                        );

        AdminPendingActionsResponse pendingActions =
                AdminPendingActionsResponse.builder()

                        .pendingVendorVerifications(
                                pendingVendorVerifications
                        )

                        .pendingServiceModerations(
                                pendingServiceModerations
                        )

                        .pendingBookings(
                                pendingBookings
                        )

                        .build();
        /*
         * =========================================
         * RESPONSE
         * =========================================
         */

        return AdminDashboardResponse.builder()

                .totalUsers(
                        totalUsers
                )

                .totalVendors(
                        totalVendors
                )

                .totalBookings(
                        totalBookings
                )

                .totalRevenue(
                        totalRevenue
                )

                .pendingBookings(
                        pendingBookings
                )

                .confirmedBookings(
                        confirmedBookings
                )

                .completedBookings(
                        completedBookings
                )

                .cancelledBookings(
                        cancelledBookings
                )

                .activeCustomers(
                        activeCustomers
                )

                .activeVendors(
                        activeVendors
                )

                .activeServices(
                        activeServices
                )

                .totalReviews(
                        totalReviews
                )

                .recentBookings(
                        recentBookings
                )

                .bookingTrend(
                        bookingTrend
                )

                .revenueTrend(
                        revenueTrend
                )
                .pendingActions(
                        pendingActions
                )
                .build();
    }

    /*
     * =========================================
     * REVENUE TREND MAPPER
     * =========================================
     */

    private AdminRevenueTrendResponse
    toRevenueTrendResponse(
            Object[] result
    ) {

        BigDecimal revenue =
                result[1] instanceof BigDecimal
                        ? (BigDecimal) result[1]
                        : BigDecimal.valueOf(
                        ((Number) result[1])
                                .doubleValue()
                );

        return AdminRevenueTrendResponse
                .builder()

                .period(
                        String.valueOf(
                                result[0]
                        )
                )

                .revenue(
                        revenue
                )

                .build();
    }


    /*
     * =========================================
     * RECENT BOOKING MAPPER
     * =========================================
     */

    private AdminRecentBookingResponse
    toRecentBookingResponse(
            Booking booking
    ) {

        return AdminRecentBookingResponse
                .builder()

                .id(
                        booking.getId()
                )

                .bookingNumber(
                        booking.getBookingNumber()
                )

                .customerName(
                        booking.getCustomerName()
                )

                .serviceName(
                        booking.getServiceName()
                )

                .eventDate(
                        booking.getEventDate()
                )

                .totalAmount(
                        booking.getTotalAmount()
                )

                .status(
                        booking.getStatus() != null
                                ? booking.getStatus().name()
                                : null
                )

                .build();
    }
}