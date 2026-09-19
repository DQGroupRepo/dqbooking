package com.booking.service.impl;

import com.booking.dto.vendorservice.DashboardResponse;
import com.booking.dto.vendorservice.RecentBookingDto;
import com.booking.model.Booking;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.Role;
import com.booking.model.enums.VendorPage;
import com.booking.repository.BookingRepository;
import com.booking.repository.ReviewRepository;
import com.booking.repository.UserRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorDashboardService;

import com.booking.service.VendorPermissionService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorDashboardServiceImpl
        implements VendorDashboardService {

    private final BookingRepository bookingRepository;

    private final UserRepository userRepository;

    private final VendorAccessService vendorAccessService;

    private final ReviewRepository reviewRepository;

    private final VendorPermissionService vendorPermissionService;


    @Override
    public DashboardResponse getDashboard() {

        vendorPermissionService.checkView(
                VendorPage.DASHBOARD
        );
        /*
         * =========================================
         * EFFECTIVE VENDOR
         * =========================================
         *
         * VENDOR_ADMIN:
         *     VendorAdmin User._id
         *
         * VENDOR_USER:
         *     User.vendorId
         *
         * ADMIN SUPPORT MODE:
         *     VendorAdmin User._id stored in
         *     VendorSupportSession.vendorId
         */

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();


        /*
         * =========================================
         * LOAD VENDOR ADMIN
         * =========================================
         *
         * vendorId is now the VendorAdmin User._id.
         */

        User vendor =
                userRepository
                        .findById(vendorId)
                        .filter(
                                user ->
                                        user.getRole() ==
                                                Role.VENDOR_ADMIN
                        )
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Vendor admin not found."
                                )
                        );


        /*
         * =========================================
         * BOOKINGS
         * =========================================
         */

        List<Booking> bookings =
                bookingRepository.findByVendorId(
                        vendorId
                );


        int pendingBookings =
                bookingRepository
                        .findByVendorIdAndStatus(
                                vendorId,
                                BookingStatus.PENDING
                        )
                        .size();


        int completedBookings =
                bookingRepository
                        .findByVendorIdAndStatus(
                                vendorId,
                                BookingStatus.COMPLETED
                        )
                        .size();


        /*
         * =========================================
         * MONTHLY REVENUE
         * =========================================
         */

        BigDecimal monthlyRevenue =
                bookingRepository
                        .findByVendorIdAndEventDateBetween(
                                vendorId,
                                LocalDate.now().withDayOfMonth(1),
                                LocalDate.now()
                        )
                        .stream()
                        .filter(
                                b ->
                                        b.getStatus() ==
                                                BookingStatus.COMPLETED
                        )
                        .map(
                                Booking::getTotalAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        /*
         * =========================================
         * REVIEWS
         * =========================================
         *
         * Rating comes from the reviews
         * collection.
         */

        List<Review> reviews =
                reviewRepository.findByVendorId(
                        vendorId
                );


        double averageRating =
                reviews.isEmpty()

                        ? 0.0

                        : reviews
                        .stream()
                        .map(
                                Review::getRating
                        )
                        .filter(
                                rating ->
                                        rating != null
                        )
                        .mapToInt(
                                Integer::intValue
                        )
                        .average()
                        .orElse(0.0);


        /*
         * =========================================
         * RECENT BOOKINGS
         * =========================================
         */

        List<RecentBookingDto> recentBookings =
                bookingRepository
                        .findTop5ByVendorIdOrderByCreatedTsDesc(
                                vendorId
                        )
                        .stream()
                        .map(
                                this::toRecentBooking
                        )
                        .toList();


        /*
         * =========================================
         * RESPONSE
         * =========================================
         */

        return DashboardResponse
                .builder()

                .vendorName(
                        vendor.getBusinessName()
                )

                .totalBookings(
                        bookings.size()
                )

                .pendingBookings(
                        pendingBookings
                )

                .completedBookings(
                        completedBookings
                )

                .monthlyRevenue(
                        monthlyRevenue
                )

                .averageRating(
                        averageRating
                )

                .recentBookings(
                        recentBookings
                )

                .build();

    }


    private RecentBookingDto toRecentBooking(
            Booking booking
    ) {

        String customerEmail =
                userRepository
                        .findById(
                                booking.getCustomerId()
                        )
                        .map(
                                User::getEmail
                        )
                        .orElse(
                                "Unknown"
                        );


        return RecentBookingDto
                .builder()

                .bookingId(
                        booking.getBookingNumber()
                )

                .customerName(
                        customerEmail
                )

                .serviceName(
                        booking.getServiceName()
                )

                .eventDate(
                        booking.getEventDate()
                )

                .status(
                        booking.getStatus().name()
                )

                .amount(
                        booking.getTotalAmount()
                )

                .build();

    }

}