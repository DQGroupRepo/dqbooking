package com.booking.mapper.impl;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.pricing.DiscountSnapshot;
import com.booking.mapper.BookingMapper;
import com.booking.model.Booking;
import com.booking.model.enums.BookingStatus;
import org.springframework.stereotype.Component;
import com.booking.dto.pricing.BookingPricingResponse;
import com.booking.model.embedded.BookingPricingSnapshot;
import com.booking.dto.pricing.PricingHeadSnapshot;

import java.util.List;

@Component
public class BookingMapperImpl implements BookingMapper {

    @Override
    public BookingResponse toResponse(
            Booking booking
    ) {

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

                .serviceName(
                        booking.getServiceName()
                )

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

                .customerName(
                        booking.getCustomerName()
                )

                .customerPhone(
                        booking.getCustomerPhone()
                )

                .customerEmail(
                        booking.getCustomerEmail()
                )

                .venue(
                        booking.getVenue()
                )

                .paidAmount(
                        booking.getPaidAmount()
                )

                .pricing(
                        mapPricing(
                                booking.getPricingSnapshot()
                        )
                )
                .cancellable(
                        booking.getStatus() == BookingStatus.PENDING
                                ||
                                booking.getStatus() == BookingStatus.CONFIRMED
                )

                .build();
    }

    private BookingPricingResponse mapPricing(
            BookingPricingSnapshot snapshot
    ) {

        if (snapshot == null) {
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
                                : snapshot.getPricingHeads()
                                .stream()
                                .map(head ->
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
                                : snapshot.getDiscounts()
                                .stream()
                                .map(discount ->
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