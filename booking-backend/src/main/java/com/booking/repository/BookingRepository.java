package com.booking.repository;

import com.booking.model.Booking;
import com.booking.model.enums.BookingStatus;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByVendorId(String vendorId);

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByVendorIdAndStatus(
            String vendorId,
            BookingStatus status
    );

    List<Booking> findByVendorIdAndEventDateBetween(
            String vendorId,
            LocalDate start,
            LocalDate end
    );

    List<Booking> findTop5ByVendorIdOrderByCreatedTsDesc(
            String vendorId
    );

    List<Booking> findByServiceId(String serviceId);

    List<Booking> findByCustomerIdOrderByCreatedTsDesc(
            String customerId
    );

    List<Booking> findTop5ByOrderByCreatedTsDesc();

    List<Booking> findByBookingGroupId(
            String bookingGroupId
    );
    /*
     * =========================================
     * ADMIN DASHBOARD ANALYTICS
     * =========================================
     */

    @Aggregation(pipeline = {
            "{ '$match': { " +
                    "'createdAt': { '$gte': ?0 } " +
                    "} }",

            "{ '$group': { " +
                    "'_id': { '$dateToString': { " +
                    "'format': '%Y-%m', " +
                    "'date': '$createdAt' " +
                    "} }, " +
                    "'bookings': { '$sum': 1 } " +
                    "} }",

            "{ '$project': { " +
                    "'_id': 0, " +
                    "'period': '$_id', " +
                    "'bookings': 1 " +
                    "} }",

            "{ '$sort': { 'period': 1 } }"
    })
    List<AdminBookingTrendProjection> findMonthlyBookingTrend(
            LocalDateTime startDate
    );


    @Aggregation(pipeline = {
            "{ '$match': { " +
                    "'createdAt': { '$gte': ?0 } " +
                    "} }",

            "{ '$group': { " +
                    "'_id': { '$dateToString': { " +
                    "'format': '%Y-%m', " +
                    "'date': '$createdAt' " +
                    "} }, " +
                    "'revenue': { '$sum': '$totalAmount' } " +
                    "} }",

            "{ '$project': { " +
                    "'_id': 0, " +
                    "'period': '$_id', " +
                    "'revenue': 1 " +
                    "} }",

            "{ '$sort': { 'period': 1 } }"
    })
    List<AdminRevenueTrendProjection> findMonthlyRevenueTrend(
            LocalDateTime startDate
    );


}