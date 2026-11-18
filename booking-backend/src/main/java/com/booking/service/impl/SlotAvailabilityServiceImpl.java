package com.booking.service.impl;

import com.booking.dto.availability.SlotAvailabilityResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.AvailabilityOverride;
import com.booking.model.Booking;
import com.booking.model.BookingSlot;
import com.booking.model.enums.BookingStatus;
import com.booking.repository.AvailabilityOverrideRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.BookingSlotRepository;
import com.booking.service.SlotAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotAvailabilityServiceImpl
        implements SlotAvailabilityService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    SlotAvailabilityServiceImpl.class
            );

    private final BookingSlotRepository bookingSlotRepository;

    private final BookingRepository bookingRepository;

    private final AvailabilityOverrideRepository
            availabilityOverrideRepository;


    @Override
    public List<SlotAvailabilityResponse> getAvailability(
            String serviceId,
            LocalDate date
    ) {

        log.debug(
                "Calculating slot availability serviceId={} date={}",
                serviceId,
                date
        );

        if (date == null) {
            throw new IllegalArgumentException(
                    "Date is required."
            );
        }

        List<BookingSlot> slots =
                bookingSlotRepository
                        .findByServiceIdOrderByDisplayOrderAsc(
                                serviceId
                        );

        List<SlotAvailabilityResponse> result =
                slots.stream()
                        .filter(BookingSlot::getActive)
                        .map(slot ->
                                calculateAvailability(
                                        slot,
                                        date
                                )
                        )
                        .toList();

        log.info(
                "Slot availability calculated serviceId={} date={} slotCount={}",
                serviceId,
                date,
                result.size()
        );

        return result;
    }


    @Override
    public SlotAvailabilityResponse getAvailability(
            String serviceId,
            String slotId,
            LocalDate date
    ) {

        log.debug(
                "Calculating slot availability serviceId={} slotId={} date={}",
                serviceId,
                slotId,
                date
        );

        BookingSlot slot =
                bookingSlotRepository
                        .findById(slotId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Booking slot not found slotId={}",
                                    slotId
                            );

                            return new ResourceNotFoundException(
                                    "Booking Slot not found."
                            );
                        });

        if (!serviceId.equals(slot.getServiceId())) {

            log.warn(
                    "Slot does not belong to service serviceId={} slotId={} slotServiceId={}",
                    serviceId,
                    slotId,
                    slot.getServiceId()
            );

            throw new IllegalArgumentException(
                    "Booking slot does not belong to the service."
            );
        }

        if (!Boolean.TRUE.equals(slot.getActive())) {

            log.warn(
                    "Inactive booking slot requested slotId={}",
                    slotId
            );

            throw new IllegalArgumentException(
                    "Booking slot is inactive."
            );
        }

        return calculateAvailability(
                slot,
                date
        );
    }


    @Override
    public void validateAvailability(
            String serviceId,
            String slotId,
            LocalDate date,
            int requestedUnits
    ) {

        if (requestedUnits < 1) {

            throw new IllegalArgumentException(
                    "Requested availability must be at least 1."
            );
        }

        SlotAvailabilityResponse availability =
                getAvailability(
                        serviceId,
                        slotId,
                        date
                );

        if (!Boolean.TRUE.equals(
                availability.getAvailable()
        )) {

            log.warn(
                    "Slot unavailable serviceId={} slotId={} date={} requestedUnits={} remainingCapacity={}",
                    serviceId,
                    slotId,
                    date,
                    requestedUnits,
                    availability.getRemainingCapacity()
            );

            throw new IllegalStateException(
                    "The selected booking slot is no longer available."
            );
        }

        if (availability.getRemainingCapacity()
                < requestedUnits) {

            log.warn(
                    "Insufficient slot capacity serviceId={} slotId={} date={} requestedUnits={} remainingCapacity={}",
                    serviceId,
                    slotId,
                    date,
                    requestedUnits,
                    availability.getRemainingCapacity()
            );

            throw new IllegalStateException(
                    "The selected booking slot does not have enough remaining capacity."
            );
        }

        log.debug(
                "Slot availability validated serviceId={} slotId={} date={} requestedUnits={} remainingCapacity={}",
                serviceId,
                slotId,
                date,
                requestedUnits,
                availability.getRemainingCapacity()
        );
    }


    private SlotAvailabilityResponse calculateAvailability(
            BookingSlot slot,
            LocalDate date
    ) {

        int baseCapacity =
                slot.getMaxBookings();

        int effectiveCapacity =
                baseCapacity;

        boolean vendorBlocked =
                false;


        /*
         * =========================================
         * VENDOR DATE-SPECIFIC OVERRIDE
         * =========================================
         */

        AvailabilityOverride override =
                availabilityOverrideRepository
                        .findByServiceIdAndSlotIdAndDate(
                                slot.getServiceId(),
                                slot.getId(),
                                date
                        )
                        .orElse(null);


        if (override != null) {

            if (Boolean.TRUE.equals(
                    override.getBlocked()
            )) {

                /*
                 * Vendor has completely blocked
                 * this slot for this date.
                 */
                effectiveCapacity = 0;

                vendorBlocked = true;

            } else if (
                    override.getCapacityOverride() != null
            ) {

                effectiveCapacity =
                        override.getCapacityOverride();
            }
        }


        /*
         * Never allow an invalid negative capacity.
         */
        effectiveCapacity =
                Math.max(
                        effectiveCapacity,
                        0
                );


        /*
         * =========================================
         * EXISTING BOOKINGS
         * =========================================
         */

        long bookedCount =
                bookingRepository.findByServiceId(slot.getServiceId()).stream()
                        .filter(b -> slot.getId().equals(b.getSlotId()))
                        .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                        .filter(b -> b.getBookingFrom() != null && b.getBookingTo() != null)
                        .filter(b -> b.getBookingFrom().isBefore(date.atTime(slot.getEndTime()))
                                && b.getBookingTo().isAfter(date.atTime(slot.getStartTime())))
                        .count();


        /*
         * =========================================
         * REMAINING CAPACITY
         * =========================================
         */

        int remainingCapacity =
                Math.max(
                        effectiveCapacity
                                - Math.toIntExact(
                                bookedCount
                        ),
                        0
                );


        boolean available =
                !vendorBlocked
                        && remainingCapacity > 0;


        log.debug(
                "Availability calculated serviceId={} slotId={} date={} baseCapacity={} effectiveCapacity={} bookedCount={} remainingCapacity={} vendorBlocked={}",
                slot.getServiceId(),
                slot.getId(),
                date,
                baseCapacity,
                effectiveCapacity,
                bookedCount,
                remainingCapacity,
                vendorBlocked
        );


        return SlotAvailabilityResponse
                .builder()

                .slotId(
                        slot.getId()
                )

                .serviceId(
                        slot.getServiceId()
                )

                .slotName(
                        slot.getSlotName()
                )

                .startTime(
                        slot.getStartTime()
                )

                .endTime(
                        slot.getEndTime()
                )

                .date(
                        date
                )

                .baseCapacity(
                        baseCapacity
                )

                .effectiveCapacity(
                        effectiveCapacity
                )

                .bookedCount(
                        Math.toIntExact(
                                bookedCount
                        )
                )

                .remainingCapacity(
                        remainingCapacity
                )

                .available(
                        available
                )

                .vendorBlocked(
                        vendorBlocked
                )

                .build();
    }
}