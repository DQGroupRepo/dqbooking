package com.booking.service.impl;

import com.booking.dto.availability.SlotAvailabilityResponse;
import com.booking.model.AvailabilityOverride;
import com.booking.model.Booking;
import com.booking.model.BookingHold;
import com.booking.model.BookingSlot;
import com.booking.model.enums.BookingHoldStatus;
import com.booking.model.enums.BookingStatus;
import com.booking.repository.AvailabilityOverrideRepository;
import com.booking.repository.BookingHoldRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.BookingSlotRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.BookingAvailabilityService;
import com.booking.dto.availability.BookingHoldResponse;
import com.booking.dto.availability.CreateBookingHoldRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingAvailabilityServiceImpl
        implements BookingAvailabilityService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    BookingAvailabilityServiceImpl.class
            );

    private final BookingSlotRepository bookingSlotRepository;

    private final AvailabilityOverrideRepository
            availabilityOverrideRepository;

    private final BookingRepository bookingRepository;

    private final BookingHoldRepository bookingHoldRepository;
    private final AuthenticatedUserService authenticatedUserService;


    /*
     * =========================================
     * GET ALL SLOT AVAILABILITY
     * =========================================
     */

    @Override
    public List<SlotAvailabilityResponse> getSlotAvailability(
            String serviceId,
            LocalDate date
    ) {

        log.debug(
                "Fetching slot availability serviceId={} date={}",
                serviceId,
                date
        );

        List<BookingSlot> slots =
                bookingSlotRepository
                        .findByServiceIdOrderByDisplayOrderAsc(
                                serviceId
                        );

        LocalDateTime now = LocalDateTime.now();

        List<SlotAvailabilityResponse> responses =
                slots.stream()
                        .map(slot ->
                                calculateAvailability(
                                        serviceId,
                                        slot,
                                        date,
                                        now
                                )
                        )
                        .toList();

        log.debug(
                "Slot availability calculated serviceId={} date={} slotCount={}",
                serviceId,
                date,
                responses.size()
        );

        return responses;
    }


    /*
     * =========================================
     * GET ONE SLOT AVAILABILITY
     * =========================================
     */

    @Override
    public SlotAvailabilityResponse getSlotAvailability(
            String serviceId,
            String slotId,
            LocalDate date
    ) {

        log.debug(
                "Fetching slot availability serviceId={} slotId={} date={}",
                serviceId,
                slotId,
                date
        );

        BookingSlot slot =
                bookingSlotRepository.findById(slotId)
                        .orElseThrow(() -> {
                            log.warn(
                                    "Booking slot not found slotId={}",
                                    slotId
                            );

                            return new IllegalArgumentException(
                                    "Booking Slot not found."
                            );
                        });

        if (!serviceId.equals(slot.getServiceId())) {

            log.warn(
                    "Booking slot does not belong to service " +
                            "serviceId={} slotId={} actualServiceId={}",
                    serviceId,
                    slotId,
                    slot.getServiceId()
            );

            throw new IllegalArgumentException(
                    "Booking Slot does not belong to this service."
            );
        }

        return calculateAvailability(
                serviceId,
                slot,
                date,
                LocalDateTime.now()
        );
    }

    @Override
    public BookingHoldResponse holdSlot(
            CreateBookingHoldRequest request
    ) {

        log.info(
                "Creating booking hold serviceId={} slotId={} eventDate={} quantity={} cartId={}",
                request.getServiceId(),
                request.getSlotId(),
                request.getEventDate(),
                request.getQuantity(),
                request.getCartId()
        );

        /*
         * =========================================
         * VALIDATE QUANTITY
         * =========================================
         */

        int quantity =
                request.getQuantity() == null
                        ? 1
                        : request.getQuantity();

        if (quantity < 1) {

            log.warn(
                    "Booking hold rejected due to invalid quantity={} serviceId={} slotId={}",
                    quantity,
                    request.getServiceId(),
                    request.getSlotId()
            );

            throw new IllegalArgumentException(
                    "Hold quantity must be at least 1."
            );
        }


        /*
         * =========================================
         * VALIDATE SLOT
         * =========================================
         */

        BookingSlot slot =
                bookingSlotRepository
                        .findById(request.getSlotId())
                        .orElseThrow(() -> {

                            log.warn(
                                    "Booking hold rejected. Slot not found slotId={}",
                                    request.getSlotId()
                            );

                            return new IllegalArgumentException(
                                    "Booking Slot not found."
                            );
                        });


        if (!request.getServiceId().equals(
                slot.getServiceId()
        )) {

            log.warn(
                    "Booking hold rejected. Slot does not belong to service " +
                            "serviceId={} slotId={} actualServiceId={}",
                    request.getServiceId(),
                    request.getSlotId(),
                    slot.getServiceId()
            );

            throw new IllegalArgumentException(
                    "Booking Slot does not belong to this service."
            );
        }


        /*
         * =========================================
         * CHECK CURRENT AVAILABILITY
         * =========================================
         *
         * IMPORTANT:
         *
         * We calculate availability immediately before
         * creating the hold.
         *
         * This includes:
         *
         *     effective capacity
         *     - existing bookings
         *     - active holds
         */

        LocalDateTime now = LocalDateTime.now();

        SlotAvailabilityResponse availability =
                calculateAvailability(
                        request.getServiceId(),
                        slot,
                        request.getEventDate(),
                        now
                );


        int remainingCapacity =
                availability.getRemainingCapacity() == null
                        ? 0
                        : availability.getRemainingCapacity();


        if (remainingCapacity < quantity) {

            log.info(
                    "Booking hold rejected. Insufficient availability " +
                            "serviceId={} slotId={} eventDate={} " +
                            "requested={} remaining={}",
                    request.getServiceId(),
                    request.getSlotId(),
                    request.getEventDate(),
                    quantity,
                    remainingCapacity
            );

            throw new IllegalStateException(
                    "This slot is no longer available for the requested quantity. " +
                            "Someone else may have already reserved it. " +
                            "Please check the availability again."
            );
        }

        var customer = authenticatedUserService.getCurrentUser();

        String customerId = customer.getId();

        if (customerId == null || customerId.isBlank()) {
            throw new IllegalStateException(
                    "Unable to identify the authenticated customer."
            );
        }


        /*
         * =========================================
         * CREATE TEMPORARY HOLD
         * =========================================
         *
         * Holds are valid for 5 minutes.
         *
         * BookingHold is deliberately separate from
         * AvailabilityOverride.
         *
         * AvailabilityOverride = vendor control
         * BookingHold          = customer cart hold
         */

        BookingHold hold = new BookingHold();

        hold.setServiceId(
                request.getServiceId()
        );

        hold.setSlotId(
                request.getSlotId()
        );

        hold.setEventDate(
                request.getEventDate()
        );

        hold.setCartId(
                request.getCartId()
        );

        hold.setQuantity(
                quantity
        );

        hold.setStatus(
                BookingHoldStatus.ACTIVE
        );

        hold.setExpiresAt(
                now.plusMinutes(5)
        );
        hold.setCustomerId(customerId);

        BookingHold savedHold =
                bookingHoldRepository.save(hold);


        log.info(
                "Booking hold created holdId={} serviceId={} slotId={} " +
                        "eventDate={} quantity={} expiresAt={}",
                savedHold.getId(),
                savedHold.getServiceId(),
                savedHold.getSlotId(),
                savedHold.getEventDate(),
                savedHold.getQuantity(),
                savedHold.getExpiresAt(),
                savedHold.getCustomerId()
        );


        /*
         * =========================================
         * RESPONSE
         * =========================================
         */

        return BookingHoldResponse.builder()
                .holdId(savedHold.getId())
                .serviceId(savedHold.getServiceId())
                .slotId(savedHold.getSlotId())
                .eventDate(savedHold.getEventDate())
                .quantity(savedHold.getQuantity())
                .expiresAt(savedHold.getExpiresAt())
                .build();
    }


    /*
     * =========================================
     * CALCULATE AVAILABILITY
     * =========================================
     */

    private SlotAvailabilityResponse calculateAvailability(
            String serviceId,
            BookingSlot slot,
            LocalDate date,
            LocalDateTime now
    ) {

        int slotCapacity =
                slot.getMaxBookings() == null
                        ? 0
                        : Math.max(
                        0,
                        slot.getMaxBookings()
                );

        int effectiveCapacity =
                calculateEffectiveCapacity(
                        serviceId,
                        slot,
                        date,
                        slotCapacity
                );

        int bookedCount =
                getBookedCount(
                        serviceId,
                        slot.getId(),
                        date
                );

        int heldCount =
                getHeldCount(
                        serviceId,
                        slot.getId(),
                        date,
                        now
                );

        int availableCount =
                Math.max(
                        0,
                        effectiveCapacity
                                - bookedCount
                                - heldCount
                );

        boolean available =
                availableCount > 0;

        log.debug(
                "Availability calculated " +
                        "serviceId={} slotId={} date={} " +
                        "slotCapacity={} effectiveCapacity={} " +
                        "bookedCount={} heldCount={} availableCount={}",
                serviceId,
                slot.getId(),
                date,
                slotCapacity,
                effectiveCapacity,
                bookedCount,
                heldCount,
                availableCount
        );

        return SlotAvailabilityResponse.builder()
                .slotId(slot.getId())
                .serviceId(serviceId)
                .slotName(slot.getSlotName())
                .date(date)
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .baseCapacity(slotCapacity)
                .effectiveCapacity(effectiveCapacity)
                .bookedCount(bookedCount)
                .remainingCapacity(availableCount)
                .available(available)
                .vendorBlocked(effectiveCapacity == 0 && hasVendorBlock(
                        serviceId,
                        slot.getId(),
                        date
                ))
                .build();
    }

    private boolean hasVendorBlock(
            String serviceId,
            String slotId,
            LocalDate date
    ) {
        return availabilityOverrideRepository
                .findByServiceIdAndSlotIdAndDate(
                        serviceId,
                        slotId,
                        date
                )
                .map(override ->
                        Boolean.TRUE.equals(
                                override.getBlocked()
                        )
                )
                .orElse(false);
    }


    /*
     * =========================================
     * EFFECTIVE CAPACITY
     * =========================================
     *
     * Normal case:
     *
     * BookingSlot.maxBookings = 3
     * no override
     * => effective capacity = 3
     *
     * Partial override:
     *
     * BookingSlot.maxBookings = 3
     * capacityOverride = 1
     * => effective capacity = 1
     *
     * Full block:
     *
     * blocked = true
     * => effective capacity = 0
     *
     * NOTE:
     * Validation preventing a vendor from reducing
     * capacity below existing bookings will be added
     * in the AvailabilityOverrideService change.
     */

    private int calculateEffectiveCapacity(
            String serviceId,
            BookingSlot slot,
            LocalDate date,
            int slotCapacity
    ) {

        AvailabilityOverride override =
                availabilityOverrideRepository
                        .findByServiceIdAndSlotIdAndDate(
                                serviceId,
                                slot.getId(),
                                date
                        )
                        .orElse(null);

        if (override == null) {
            return slotCapacity;
        }

        if (Boolean.TRUE.equals(
                override.getBlocked()
        )) {

            return 0;
        }

        if (override.getCapacityOverride() == null) {
            return slotCapacity;
        }

        return Math.max(
                0,
                Math.min(
                        slotCapacity,
                        override.getCapacityOverride()
                )
        );
    }


    /*
     * =========================================
     * BOOKED COUNT
     * =========================================
     *
     * A booking counts against availability when
     * it is PENDING or CONFIRMED.
     *
     * Cancelled / rejected / completed bookings
     * do not consume current availability.
     */

    private int getBookedCount(
            String serviceId,
            String slotId,
            LocalDate date
    ) {

        List<Booking> bookings =
                bookingRepository
                        .findByServiceIdAndEventDate(
                                serviceId,
                                date
                        );

        return (int) bookings.stream()
                .filter(booking ->
                        slotId.equals(
                                booking.getSlotId()
                        )
                )
                .filter(this::countsAgainstAvailability)
                .count();
    }


    private boolean countsAgainstAvailability(
            Booking booking
    ) {

        BookingStatus status =
                booking.getStatus();

        if (status == null) {
            return false;
        }

        return status == BookingStatus.PENDING
                || status == BookingStatus.CONFIRMED;
    }


    /*
     * =========================================
     * ACTIVE HOLD COUNT
     * =========================================
     *
     * Only ACTIVE holds whose expiration is still
     * in the future consume availability.
     *
     * Expired holds therefore automatically stop
     * consuming availability without requiring a
     * background cleanup job.
     */

    private int getHeldCount(
            String serviceId,
            String slotId,
            LocalDate date,
            LocalDateTime now
    ) {

        List<BookingHold> holds =
                bookingHoldRepository
                        .findByServiceIdAndSlotIdAndEventDateAndStatusAndExpiresAtAfter(
                                serviceId,
                                slotId,
                                date,
                                BookingHoldStatus.ACTIVE,
                                now
                        );

        return holds.stream()
                .mapToInt(hold ->
                        hold.getQuantity() == null
                                ? 0
                                : Math.max(
                                0,
                                hold.getQuantity()
                        )
                )
                .sum();
    }


}