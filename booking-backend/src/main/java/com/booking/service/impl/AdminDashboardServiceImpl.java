package com.booking.service.impl;

import com.booking.dto.admin.AdminDashboardResponse;
import com.booking.dto.admin.AdminRecentBookingResponse;
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

import java.math.BigDecimal;
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
         * BOOKING COUNTS
         * =========================================
         */

        long totalBookings =
                bookingRepository.count();

        long pendingBookings =
                bookingRepository
                        .findAll()
                        .stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.PENDING
                        )
                        .count();

        long confirmedBookings =
                bookingRepository
                        .findAll()
                        .stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.CONFIRMED
                        )
                        .count();

        long completedBookings =
                bookingRepository
                        .findAll()
                        .stream()
                        .filter(booking ->
                                booking.getStatus()
                                        == BookingStatus.COMPLETED
                        )
                        .count();

        long cancelledBookings =
                bookingRepository
                        .findAll()
                        .stream()
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
                bookingRepository
                        .findAll()
                        .stream()
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

        List<AdminRecentBookingResponse> recentBookings =
                bookingRepository
                        .findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::toRecentBookingResponse)
                        .toList();


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