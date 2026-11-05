package com.booking.service.impl;

import com.booking.dto.availability.SlotAvailabilityResponse;
import com.booking.model.AvailabilityOverride;
import com.booking.model.Booking;
import com.booking.model.BookingHold;
import com.booking.model.BookingSlot;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.enums.ServiceCategory;
import com.booking.model.enums.BookingHoldStatus;
import com.booking.model.enums.BookingStatus;
import com.booking.repository.AvailabilityOverrideRepository;
import com.booking.repository.BookingHoldRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.BookingSlotRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.repository.VendorServicePricingRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.BookingAvailabilityService;
import com.booking.dto.availability.BookingHoldResponse;
import com.booking.dto.availability.CreateBookingHoldRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
    private final VendorServiceRepository vendorServiceRepository;
    private final VendorServicePricingRepository vendorServicePricingRepository;

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
    public BookingHoldResponse holdSlot(CreateBookingHoldRequest request) {
        if (request == null) throw new IllegalArgumentException("Booking hold request is required.");
        if (request.getBookingFrom() == null || request.getBookingTo() == null
                || !request.getBookingTo().isAfter(request.getBookingFrom())) {
            throw new IllegalArgumentException("Booking end must be after booking start; both date-times are required.");
        }
        if (request.getServiceId() == null || request.getServiceId().isBlank()) {
            throw new IllegalArgumentException("Service is required.");
        }
        int quantity = request.getQuantity() == null ? 1 : request.getQuantity();
        if (quantity < 1) throw new IllegalArgumentException("Hold quantity must be at least 1.");

        String bookingType = request.getBookingType() == null
                ? "STANDARD_SLOT" : request.getBookingType().trim().toUpperCase(java.util.Locale.ROOT);
        VendorService service = vendorServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor Service not found."));
        boolean isStay = service.getCategory() == ServiceCategory.STAY;

        ServicePackage selectedPackage = null;
        if (request.getPackageId() != null && !request.getPackageId().isBlank()) {
            selectedPackage = resolvePackageForHold(request.getServiceId(), request.getPackageId(), request.getBookingFrom().toLocalDate());
        }

        boolean requiresSlot = isStay || selectedPackage == null
                || !Boolean.FALSE.equals(selectedPackage.getRequiresSlot());
        if (!requiresSlot && !isStay) {
            throw new IllegalArgumentException("Slot-free packages are supported only for STAY services.");
        }
        if (requiresSlot && (request.getSlotId() == null || request.getSlotId().isBlank())) {
            throw new IllegalArgumentException("Booking slot is required for this package.");
        }

        BookingSlot slot = null;
        if (request.getSlotId() != null && !request.getSlotId().isBlank()) {
            slot = bookingSlotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new IllegalArgumentException("Booking Slot not found."));
            if (!request.getServiceId().equals(slot.getServiceId())) {
                throw new IllegalArgumentException("Booking Slot does not belong to this service.");
            }
            if (selectedPackage != null && selectedPackage.getSlotIds() != null
                    && !selectedPackage.getSlotIds().isEmpty()
                    && !selectedPackage.getSlotIds().contains(slot.getId())) {
                throw new IllegalArgumentException("The selected booking slot is not available for this package.");
            }
        }

        if (selectedPackage != null && !selectedPackage.isActive()) {
            throw new IllegalArgumentException("Selected package is not active.");
        }
        if (isStay && selectedPackage != null
                && (selectedPackage.getSlotIds() == null || selectedPackage.getSlotIds().isEmpty())) {
            throw new IllegalArgumentException("The selected STAY package must be assigned to at least one booking slot.");
        }

        var customer = authenticatedUserService.getCurrentUser();
        String customerId = customer == null ? null : customer.getId();
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalStateException("Unable to identify the authenticated customer.");
        }

        int roomQuantity = request.getRoomQuantity() == null ? 1 : request.getRoomQuantity();
        if (isStay) {
            if (selectedPackage == null) throw new IllegalArgumentException("A package is required for STAY bookings.");
            if (selectedPackage.getMaxGuestsPerRoom() == null || selectedPackage.getMaxGuestsPerRoom() < 1) {
                throw new IllegalArgumentException("The selected STAY package has no valid guest capacity per room.");
            }
            if (roomQuantity < 1) throw new IllegalArgumentException("At least one room must be selected.");
            // One requested room consumes one unit of the selected slot's capacity.
            quantity = roomQuantity;
            bookingType = "ROOM_STAY";
        } else if (!"STANDARD_SLOT".equals(bookingType) && !"DAY_PACKAGE".equals(bookingType)) {
            throw new IllegalArgumentException("Unsupported booking type: " + bookingType);
        }

        LocalDateTime now = LocalDateTime.now();
        if (slot != null) {
            validateSlotCapacityForInterval(request.getServiceId(), slot,
                    request.getBookingFrom(), request.getBookingTo(), quantity, now);
        } else {
            throw new IllegalArgumentException("A valid booking slot is required.");
        }

        BookingHold hold = new BookingHold();
        hold.setServiceId(request.getServiceId());
        hold.setSlotId(slot == null ? null : slot.getId());
        hold.setPackageId(selectedPackage == null ? request.getPackageId() : selectedPackage.getId());
        hold.setBookingFrom(request.getBookingFrom());
        hold.setBookingTo(request.getBookingTo());
        hold.setBookingType(bookingType);
        hold.setRoomQuantity(isStay ? roomQuantity : request.getRoomQuantity());
        hold.setCartId(request.getCartId());
        hold.setQuantity(quantity);
        hold.setStatus(BookingHoldStatus.ACTIVE);
        hold.setExpiresAt(now.plusMinutes(5));
        hold.setCustomerId(customerId);

        BookingHold savedHold = bookingHoldRepository.save(hold);
        log.info("Booking hold created holdId={} serviceId={} slotId={} packageId={} bookingFrom={} bookingTo={} expiresAt={}",
                savedHold.getId(), savedHold.getServiceId(), savedHold.getSlotId(), savedHold.getPackageId(),
                savedHold.getBookingFrom(), savedHold.getBookingTo(), savedHold.getExpiresAt());

        return BookingHoldResponse.builder()
                .holdId(savedHold.getId())
                .serviceId(savedHold.getServiceId())
                .slotId(savedHold.getSlotId())
                .packageId(savedHold.getPackageId())
                .bookingFrom(savedHold.getBookingFrom())
                .bookingTo(savedHold.getBookingTo())
                .quantity(savedHold.getQuantity())
                .expiresAt(savedHold.getExpiresAt())
                .build();
    }

    private ServicePackage resolvePackageForHold(String serviceId, String packageId, LocalDate bookingDate) {
        VendorServicePricing pricing = vendorServicePricingRepository.findByServiceIdOrderByVersionDesc(serviceId)
                .stream()
                .filter(candidate -> candidate.getEffectiveFrom() == null || !bookingDate.isBefore(candidate.getEffectiveFrom()))
                .filter(candidate -> candidate.getEffectiveUntil() == null || !bookingDate.isAfter(candidate.getEffectiveUntil()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No applicable pricing found for service."));
        return (pricing.getPackages() == null ? java.util.Collections.<ServicePackage>emptyList() : pricing.getPackages())
                .stream().filter(pkg -> packageId.equals(pkg.getId())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Selected package not found for this service."));
    }

    /*
     * =========================================
     * RELEASE TEMPORARY HOLD
     * =========================================
     *
     * Idempotent for already released/expired/converted
     * holds. A customer may release only their own hold.
     */

    @Override
    public void releaseHold(
            String serviceId,
            String holdId
    ) {

        BookingHold hold = bookingHoldRepository.findById(holdId)
                .orElse(null);

        // Treat a missing hold as already released.
        if (hold == null) {
            return;
        }

        var customer = authenticatedUserService.getCurrentUser();
        String customerId = customer == null ? null : customer.getId();

        if (!serviceId.equals(hold.getServiceId())
                || customerId == null
                || !customerId.equals(hold.getCustomerId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to release this booking hold."
            );
        }

        if (hold.getStatus() != BookingHoldStatus.ACTIVE) {
            return;
        }

        hold.setStatus(BookingHoldStatus.RELEASED);
        hold.setReleasedAt(LocalDateTime.now());
        bookingHoldRepository.save(hold);

        log.info(
                "Booking hold released holdId={} serviceId={} customerId={}",
                holdId,
                serviceId,
                customerId
        );
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

    /**
     * Check slot capacity on every calendar date whose slot interval overlaps
     * the requested interval. Intervals are half-open [from, to), so a booking
     * ending exactly when a slot begins does not consume that slot.
     */
    private void validateSlotCapacityForInterval(
            String serviceId,
            BookingSlot slot,
            LocalDateTime bookingFrom,
            LocalDateTime bookingTo,
            int quantity,
            LocalDateTime now
    ) {
        boolean isStay = vendorServiceRepository.findById(serviceId)
                .map(service -> service.getCategory() == ServiceCategory.STAY)
                .orElse(false);
        LocalDate date = bookingFrom.toLocalDate();
        LocalDate lastDate = bookingTo.toLocalDate();
        // A STAY booking consumes room inventory for each night beginning on
        // check-in, but not for a new night on the checkout date.
        while (isStay ? date.isBefore(lastDate) : !date.isAfter(lastDate)) {
            boolean overlaps;
            if (isStay) {
                // STAY capacity is evaluated over a hotel-night window; the
                // slot's clock time is not the occupancy interval.
                overlaps = true;
            } else {
                LocalDateTime slotFrom = slotStart(date, slot);
                LocalDateTime slotTo = slotEnd(date, slot);
                overlaps = bookingFrom.isBefore(slotTo) && bookingTo.isAfter(slotFrom);
            }
            if (overlaps) {
                SlotAvailabilityResponse availability =
                        calculateAvailability(serviceId, slot, date, now);
                int remaining = availability.getRemainingCapacity() == null
                        ? 0 : availability.getRemainingCapacity();
                if (remaining < quantity) {
                    log.info("Booking hold rejected due to insufficient interval capacity serviceId={} slotId={} date={} requested={} remaining={}",
                            serviceId, slot.getId(), date, quantity, remaining);
                    throw new IllegalStateException(
                            "Not enough rooms are available for the entire requested stay. " +
                                    "Please reduce the room count or choose different dates/slot.");
                }
            }
            date = date.plusDays(1);
        }
    }

    private LocalDateTime slotStart(LocalDate date, BookingSlot slot) {
        return date.atTime(slot.getStartTime());
    }

    private LocalDateTime slotEnd(LocalDate date, BookingSlot slot) {
        LocalDateTime start = date.atTime(slot.getStartTime());
        LocalDateTime end = date.atTime(slot.getEndTime());
        // A slot ending at or before its start crosses midnight.
        return !end.isAfter(start) ? end.plusDays(1) : end;
    }

    private int getBookedCount(String serviceId, String slotId, LocalDate date) {
        BookingSlot slot = bookingSlotRepository.findById(slotId).orElse(null);
        if (slot == null || slot.getStartTime() == null || slot.getEndTime() == null) return 0;

        boolean isStay = vendorServiceRepository.findById(serviceId)
                .map(service -> service.getCategory() == ServiceCategory.STAY)
                .orElse(false);

        LocalDateTime requestedFrom = isStay ? date.atTime(14, 0) : slotStart(date, slot);
        LocalDateTime requestedTo = isStay ? date.plusDays(1).atTime(14, 0) : slotEnd(date, slot);

        // For ordinary slot-based services, overlapping slots share capacity
        // only when they are assigned to at least one common package.
        // A booking against the exact same slot always consumes that slot.
        List<String> packageIdsForRequestedSlot = isStay
                ? List.of()
                : getPackageIdsForSlot(serviceId, slotId, date);

        return (int) bookingRepository.findByServiceId(serviceId).stream()
                .filter(this::countsAgainstAvailability)
                .filter(b -> b.getBookingFrom() != null && b.getBookingTo() != null)
                .filter(b -> b.getBookingFrom().isBefore(requestedTo) && b.getBookingTo().isAfter(requestedFrom))
                .filter(b -> {
                    if (isStay) {
                        // STAY inventory remains tied to the selected slot;
                        // do not apply clock-time overlap across room slots.
                        return b.getSlotId() == null || slotId.equals(b.getSlotId());
                    }
                    if (slotId.equals(b.getSlotId())) {
                        return true;
                    }
                    if (!intervalsOverlap(b.getBookingFrom(), b.getBookingTo(), requestedFrom, requestedTo)) {
                        return false;
                    }
                    // Legacy bookings without packageId, or services whose
                    // packages have no explicit slot mapping, retain the
                    // conservative interval-overlap fallback.
                    return b.getPackageId() == null
                            || packageIdsForRequestedSlot.isEmpty()
                            || packageIdsForRequestedSlot.contains(b.getPackageId());
                })
                .mapToInt(b -> b.getRoomQuantity() != null ? b.getRoomQuantity() : 1)
                .sum();
    }

    private boolean intervalsOverlap(LocalDateTime aFrom, LocalDateTime aTo,
                                     LocalDateTime bFrom, LocalDateTime bTo) {
        return aFrom != null && aTo != null && aFrom.isBefore(bTo) && aTo.isAfter(bFrom);
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

    private int getHeldCount(String serviceId, String slotId, LocalDate date, LocalDateTime now) {
        BookingSlot slot = bookingSlotRepository.findById(slotId).orElse(null);
        if (slot == null || slot.getStartTime() == null || slot.getEndTime() == null) return 0;

        boolean isStay = vendorServiceRepository.findById(serviceId)
                .map(service -> service.getCategory() == ServiceCategory.STAY)
                .orElse(false);

        LocalDateTime requestedFrom = isStay ? date.atTime(14, 0) : slotStart(date, slot);
        LocalDateTime requestedTo = isStay ? date.plusDays(1).atTime(14, 0) : slotEnd(date, slot);
        List<String> packageIdsForRequestedSlot = isStay
                ? List.of()
                : getPackageIdsForSlot(serviceId, slotId, date);

        return bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                        serviceId, BookingHoldStatus.ACTIVE, now).stream()
                .filter(h -> h.getBookingFrom() != null && h.getBookingTo() != null)
                .filter(h -> h.getBookingFrom().isBefore(requestedTo) && h.getBookingTo().isAfter(requestedFrom))
                .filter(h -> {
                    if (isStay) {
                        return h.getSlotId() == null || slotId.equals(h.getSlotId());
                    }
                    if (slotId.equals(h.getSlotId())) {
                        return true;
                    }
                    if (!intervalsOverlap(h.getBookingFrom(), h.getBookingTo(), requestedFrom, requestedTo)) {
                        return false;
                    }
                    return h.getPackageId() == null
                            || packageIdsForRequestedSlot.isEmpty()
                            || packageIdsForRequestedSlot.contains(h.getPackageId());
                })
                .mapToInt(h -> h.getQuantity() == null ? 0 : Math.max(0, h.getQuantity()))
                .sum();
    }

    /**
     * Returns package IDs that own the requested slot in the pricing version
     * effective on the booking date. A package with no slotIds retains the
     * legacy meaning of being available for all service slots.
     */
    private List<String> getPackageIdsForSlot(String serviceId, String slotId, LocalDate date) {
        VendorServicePricing pricing = vendorServicePricingRepository
                .findByServiceIdOrderByVersionDesc(serviceId)
                .stream()
                .filter(candidate -> candidate.getEffectiveFrom() == null
                        || !date.isBefore(candidate.getEffectiveFrom()))
                .filter(candidate -> candidate.getEffectiveUntil() == null
                        || !date.isAfter(candidate.getEffectiveUntil()))
                .findFirst()
                .orElse(null);

        if (pricing == null || pricing.getPackages() == null) {
            return List.of();
        }

        return pricing.getPackages().stream()
                .filter(ServicePackage::isActive)
                .filter(pkg -> pkg.getSlotIds() == null || pkg.getSlotIds().isEmpty()
                        || pkg.getSlotIds().contains(slotId))
                .map(ServicePackage::getId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();
    }

}