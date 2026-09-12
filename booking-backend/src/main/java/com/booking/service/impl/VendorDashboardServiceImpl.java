package com.booking.service.impl;

import com.booking.dto.vendorservice.DashboardResponse;
import com.booking.dto.vendorservice.RecentBookingDto;
import com.booking.model.Booking;
import com.booking.model.Review;
import com.booking.model.User;
import com.booking.model.enums.BookingStatus;
import com.booking.repository.BookingRepository;
import com.booking.repository.ReviewRepository;
import com.booking.repository.UserRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.VendorDashboardService;
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

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository userRepository;

    private final AuthenticatedUserService authenticatedUserService;

    private final ReviewRepository reviewRepository;

    @Override
    public DashboardResponse getDashboard() {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        List<Booking> bookings =
                bookingRepository.findByVendorId(
                        vendor.getId()
                );

        int pendingBookings =
                bookingRepository
                        .findByVendorIdAndStatus(
                                vendor.getId(),
                                BookingStatus.PENDING
                        )
                        .size();

        int completedBookings =
                bookingRepository
                        .findByVendorIdAndStatus(
                                vendor.getId(),
                                BookingStatus.COMPLETED
                        )
                        .size();

        BigDecimal monthlyRevenue =
                bookingRepository
                        .findByVendorIdAndEventDateBetween(
                                vendor.getId(),
                                LocalDate.now().withDayOfMonth(1),
                                LocalDate.now()
                        )
                        .stream()
                        .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                        .map(Booking::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        /*
         * =========================================
         * REVIEWS
         *
         * Rating should come from the
         * reviews collection.
         * =========================================
         */

        List<Review> reviews =
                reviewRepository.findByVendorId(
                        vendor.getId()
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
                        .findTop5ByVendorIdOrderByCreatedAtDesc(
                                vendor.getId()
                        )
                        .stream()
                        .map(this::toRecentBooking)
                        .toList();

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
                userRepository.findById(
                                booking.getCustomerId()
                        )
                        .map(User::getEmail)
                        .orElse("Unknown");

        return RecentBookingDto.builder()
                .bookingId(booking.getBookingNumber())
                .customerName(customerEmail)
                .serviceName(booking.getServiceName())
                .eventDate(booking.getEventDate())
                .status(booking.getStatus().name())
                .amount(booking.getTotalAmount())
                .build();

    }

}