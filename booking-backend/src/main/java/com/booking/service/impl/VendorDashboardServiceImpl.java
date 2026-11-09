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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
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

        String vendorId =
                vendorAccessService
                        .getEffectiveVendorId();

        log.info(
                "Retrieving vendor dashboard vendorId={}",
                vendorId
        );

        User vendor =
                userRepository
                        .findById(vendorId)
                        .filter(
                                user ->
                                        user.getRole() ==
                                                Role.VENDOR_ADMIN
                        )
                        .orElseThrow(() -> {
                            log.warn(
                                    "Vendor admin not found while loading dashboard vendorId={}",
                                    vendorId
                            );

                            return new IllegalStateException(
                                    "Vendor admin not found."
                            );
                        });

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

        BigDecimal monthlyRevenue =
                bookingRepository
                        .findByVendorIdAndBookingFromBetween(
                                vendorId,
                                LocalDate.now().withDayOfMonth(1).atStartOfDay(),
                                LocalDate.now().plusDays(1).atStartOfDay()
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

        DashboardResponse response =
                DashboardResponse
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

        log.info(
                "Vendor dashboard retrieved vendorId={} bookingCount={} pendingCount={} completedCount={} reviewCount={} recentBookingCount={}",
                vendorId,
                bookings.size(),
                pendingBookings,
                completedBookings,
                reviews.size(),
                recentBookings.size()
        );

        return response;
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
                .bookingFrom(booking.getBookingFrom())
                .bookingTo(booking.getBookingTo())
                .status(
                        booking.getStatus().name()
                )
                .amount(
                        booking.getTotalAmount()
                )
                .build();
    }
}
