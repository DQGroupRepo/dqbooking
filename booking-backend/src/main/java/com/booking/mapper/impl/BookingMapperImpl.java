package com.booking.mapper.impl;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.pricing.BookingPricingResponse;
import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.dto.pricing.PricingHeadSnapshot;

import com.booking.mapper.BookingMapper;

import com.booking.model.Booking;
import com.booking.model.VendorService;

import com.booking.model.embedded.BookingPricingSnapshot;

import com.booking.model.enums.BookingStatus;

import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class BookingMapperImpl
        implements BookingMapper {


    /*
     * =========================================
     * NORMAL BOOKING RESPONSE
     * =========================================
     *
     * Used everywhere where we don't need
     * additional VendorService information.
     */

    @Override
    public BookingResponse toResponse(
            Booking booking
    ) {

        return toResponse(
                booking,
                null
        );

    }


    /*
     * =========================================
     * ENRICHED BOOKING RESPONSE
     * =========================================
     *
     * Used by Customer My Bookings page.
     *
     * VendorService is loaded separately using
     * booking.serviceId.
     */

    @Override
    public BookingResponse toResponse(
            Booking booking,
            VendorService vendorService
    ) {

        String serviceImage =
                null;

        String serviceCategory =
                null;


        /*
         * =========================================
         * GET SERVICE IMAGE
         * =========================================
         */

        if (
                vendorService != null &&
                        vendorService.getImageUrls() != null &&
                        !vendorService.getImageUrls().isEmpty()
        ) {

            serviceImage =
                    vendorService
                            .getImageUrls()
                            .get(0);

        }


        /*
         * =========================================
         * GET SERVICE CATEGORY
         * =========================================
         */

        if (
                vendorService != null &&
                        vendorService.getCategory() != null
        ) {

            serviceCategory =
                    vendorService
                            .getCategory()
                            .name();

        }


        return BookingResponse
                .builder()

                .id(
                        booking.getId()
                )

                .bookingGroupId(
                        booking.getBookingGroupId()
                )

                .bookingNumber(
                        booking.getBookingNumber()
                )


                /*
                 * SERVICE
                 */

                .serviceName(
                        booking.getServiceName()
                )

                .serviceImage(
                        serviceImage
                )

                .serviceCategory(
                        serviceCategory
                )


                /*
                 * BOOKING
                 */

                .totalAmount(
                        booking.getTotalAmount()
                )

                .eventDate(
                        booking.getEventDate()
                )

                .guestCount(
                        booking.getGuestCount()
                )

                .status(
                        booking.getStatus()
                )

                .paymentStatus(
                        booking.getPaymentStatus()
                )

                .specialRequest(
                        booking.getSpecialRequest()
                )

                .eventType(
                        booking.getEventType()
                )


                /*
                 * CUSTOMER
                 */

                .customerName(
                        booking.getCustomerName()
                )

                .customerPhone(
                        booking.getCustomerPhone()
                )

                .customerEmail(
                        booking.getCustomerEmail()
                )


                /*
                 * VENUE
                 */

                .venue(
                        booking.getVenue()
                )


                /*
                 * PAYMENT
                 */

                .paidAmount(
                        booking.getPaidAmount()
                )


                /*
                 * PRICING
                 */

                .pricing(
                        mapPricing(
                                booking.getPricingSnapshot()
                        )
                )


                /*
                 * CANCELLATION
                 */

                .cancellable(
                        booking.getStatus()
                                == BookingStatus.PENDING
                                ||
                                booking.getStatus()
                                        == BookingStatus.CONFIRMED
                )

                .cancelledAt(
                        booking.getCancelledAt()
                )

                .refundPercentage(
                        booking.getRefundPercentage()
                )

                .cancellationCharge(
                        booking.getCancellationCharge()
                )

                .refundableAmount(
                        booking.getRefundableAmount()
                )


                /*
                 * PACKAGE
                 */

                .packageId(
                        booking.getPackageId()
                )

                .packageType(
                        booking.getPackageType()
                )

                .build();

    }


    /*
     * =========================================
     * MAP PRICING
     * =========================================
     */

    private BookingPricingResponse mapPricing(
            BookingPricingSnapshot snapshot
    ) {

        if (
                snapshot == null
        ) {

            return null;

        }


        return BookingPricingResponse
                .builder()

                .pricingId(
                        snapshot.getPricingId()
                )

                .pricingVersion(
                        snapshot.getPricingVersion()
                )

                .baseAmount(
                        snapshot.getBaseAmount()
                )

                .pricingHeads(
                        snapshot.getPricingHeads() == null
                                ? List.of()
                                : snapshot
                                .getPricingHeads()
                                .stream()
                                .map(
                                        head ->
                                                PricingHeadSnapshot
                                                        .builder()

                                                        .code(
                                                                head.getCode()
                                                        )

                                                        .name(
                                                                head.getName()
                                                        )

                                                        .calculationType(
                                                                head.getCalculationType()
                                                        )

                                                        .value(
                                                                head.getValue()
                                                        )

                                                        .calculatedAmount(
                                                                head.getCalculatedAmount()
                                                        )

                                                        .displayOrder(
                                                                head.getDisplayOrder()
                                                        )

                                                        .build()
                                )
                                .toList()
                )

                .subtotal(
                        snapshot.getSubtotal()
                )

                .discounts(
                        snapshot.getDiscounts() == null
                                ? List.of()
                                : snapshot
                                .getDiscounts()
                                .stream()
                                .map(
                                        discount ->
                                                DiscountSnapshot
                                                        .builder()

                                                        .name(
                                                                discount.getName()
                                                        )

                                                        .discountType(
                                                                discount.getDiscountType()
                                                        )

                                                        .value(
                                                                discount.getValue()
                                                        )

                                                        .calculatedAmount(
                                                                discount.getCalculatedAmount()
                                                        )

                                                        .build()
                                )
                                .toList()
                )

                .discountAmount(
                        snapshot.getDiscountAmount()
                )

                .totalAmount(
                        snapshot.getTotalAmount()
                )

                .advanceAmount(
                        snapshot.getAdvanceAmount()
                )

                .balanceAmount(
                        snapshot.getBalanceAmount()
                )

                .build();

    }

}