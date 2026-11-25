package com.booking.service.impl;

import com.booking.dto.availability.SlotAvailabilityResponse;
import com.booking.model.AvailabilityOverride;
import com.booking.model.Booking;
import com.booking.model.BookingHold;
import com.booking.model.BookingSlot;
import com.booking.model.VendorService;
import com.booking.model.VendorServicePricing;
import com.booking.model.embedded.ServicePackage;
import com.booking.model.embedded.ServiceResourceType;
import com.booking.model.embedded.ServiceResourceUnit;
import com.booking.model.embedded.ResourceAllocation;
import com.booking.model.embedded.ResourceTypeRequirement;
import com.booking.model.embedded.BookingTimeInterval;
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
import java.time.LocalTime;
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
        return getSlotAvailability(serviceId, date, null);
    }

    @Override
    public List<SlotAvailabilityResponse> getSlotAvailability(
            String serviceId,
            LocalDate date,
            String resourceTypeId
    ) {
        log.debug("Fetching slot availability serviceId={} date={} resourceTypeId={}",
                serviceId, date, resourceTypeId);

        List<BookingSlot> slots = bookingSlotRepository
                .findByServiceIdOrderByDisplayOrderAsc(serviceId);
        LocalDateTime now = LocalDateTime.now();

        List<SlotAvailabilityResponse> responses = slots.stream()
                .map(slot -> calculateAvailability(serviceId, slot, date, now, resourceTypeId))
                .toList();

        log.debug("Slot availability calculated serviceId={} date={} slotCount={} resourceTypeId={}",
                serviceId, date, responses.size(), resourceTypeId);
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
    public List<com.booking.dto.availability.BeautyAppointmentOption> getBeautyAppointmentOptions(
            String serviceId, LocalDate date, Integer durationMinutes) {
        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor Service not found."));
        if (service.getCategory() != ServiceCategory.MAKEUP || service.getBeautyDetails() == null) {
            throw new IllegalArgumentException("Beauty appointment configuration is not available for this service.");
        }
        var details = service.getBeautyDetails();
        int capacity = service.getBookingSettings() == null || service.getBookingSettings().getMaxSimultaneousBookings() == null
                ? 0 : service.getBookingSettings().getMaxSimultaneousBookings();
        // Beauty appointment starts are fixed at 30-minute increments. This is
        // deliberately independent of legacy per-service interval values.
        final int interval = 30;
        if (capacity < 1 || durationMinutes == null || durationMinutes < 1 || interval < 1
                || details.getOpeningTime() == null || details.getClosingTime() == null
                || !details.getClosingTime().isAfter(details.getOpeningTime())) {
            throw new IllegalArgumentException("Beauty shop hours, appointment interval and maximum simultaneous customers must be configured.");
        }
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findByServiceId(serviceId);
        List<BookingHold> holds = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                serviceId, BookingHoldStatus.ACTIVE, now);
        java.util.ArrayList<com.booking.dto.availability.BeautyAppointmentOption> result = new java.util.ArrayList<>();
        for (LocalTime start = details.getOpeningTime(); !start.plusMinutes(durationMinutes).isAfter(details.getClosingTime()); start = start.plusMinutes(interval)) {
            final LocalTime appointmentStart = start;
            LocalDateTime from = LocalDateTime.of(date, appointmentStart);
            LocalDateTime to = from.plusMinutes(durationMinutes);
            if (!from.isAfter(now)) continue;
            boolean blocked = details.getBreaks() != null && details.getBreaks().stream().anyMatch(b ->
                    b.getStartTime() != null && b.getEndTime() != null
                            && appointmentStart.isBefore(b.getEndTime()) && appointmentStart.plusMinutes(durationMinutes).isAfter(b.getStartTime()));
            if (blocked) continue;
            int occupied = peakBeautyOccupancy(from, to, bookings, holds);
            int remaining = Math.max(0, capacity - occupied);
            result.add(com.booking.dto.availability.BeautyAppointmentOption.builder()
                    .startTime(appointmentStart).endTime(appointmentStart.plusMinutes(durationMinutes))
                    .durationMinutes(durationMinutes).available(remaining > 0).remainingCapacity(remaining).build());
        }
        return result;
    }

    @Override
    public synchronized BookingHoldResponse holdSlot(CreateBookingHoldRequest request) {
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
        List<BookingTimeInterval> requestedIntervals = request.getBookingIntervals() == null
                || request.getBookingIntervals().isEmpty()
                ? List.of(new BookingTimeInterval(request.getBookingFrom(), request.getBookingTo()))
                : request.getBookingIntervals();
        for (BookingTimeInterval interval : requestedIntervals) {
            if (interval == null || interval.getFrom() == null || interval.getTo() == null
                    || !interval.getTo().isAfter(interval.getFrom())) {
                throw new IllegalArgumentException("Every booking interval must have a valid start and end.");
            }
        }
        LocalDateTime validationNow = LocalDateTime.now();
        for (BookingTimeInterval interval : requestedIntervals) {
            if (!interval.getFrom().isAfter(validationNow)) {
                throw new IllegalArgumentException(
                        "This time slot has already started or passed. Please select a future slot."
                );
            }
        }
        if (!requestedIntervals.get(0).getFrom().equals(request.getBookingFrom())
                || !requestedIntervals.get(requestedIntervals.size() - 1).getTo().equals(request.getBookingTo())) {
            throw new IllegalArgumentException("Booking interval boundaries do not match bookingFrom and bookingTo.");
        }

        String bookingType = request.getBookingType() == null
                ? "STANDARD_SLOT" : request.getBookingType().trim().toUpperCase(java.util.Locale.ROOT);
        VendorService service = vendorServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor Service not found."));
        boolean isStay = service.getCategory() == ServiceCategory.STAY;
        boolean isBeauty = service.getCategory() == ServiceCategory.MAKEUP;
        boolean isCatering = service.getCategory() != null
                && "CATERING".equalsIgnoreCase(service.getCategory().name());
        boolean usesResourceTypes = service.getCategory() != null
                && service.getCategory().supportsResourceTypes();

        if (isCatering && (request.getGuestCount() == null || request.getGuestCount() < 1)) {
            throw new IllegalArgumentException("Please provide a valid guest count for Catering.");
        }

        ServicePackage selectedPackage = null;
        if (request.getPackageId() != null && !request.getPackageId().isBlank()) {
            selectedPackage = resolvePackageForHold(request.getServiceId(), request.getPackageId(), request.getBookingFrom().toLocalDate());
        }

        // Individual Beauty services use generated appointment starts; Beauty fixed
        // packages use their explicitly configured booking slots. Other categories
        // keep the pre-existing slot requirement rules unchanged.
        boolean requiresSlot = isBeauty
                ? selectedPackage != null
                : (isStay || selectedPackage == null || !Boolean.FALSE.equals(selectedPackage.getRequiresSlot()));
        if (!requiresSlot && !isStay && !isBeauty) {
            throw new IllegalArgumentException("Slot-free packages are supported only for STAY and Beauty services.");
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
            String pattern = slot.getBookingPattern() == null ? "DAILY_RECURRING"
                    : slot.getBookingPattern().toUpperCase(java.util.Locale.ROOT);
            if (!isStay && "CONTINUOUS".equals(pattern) && requestedIntervals.size() != 1) {
                throw new IllegalArgumentException("A continuous slot must be submitted as one uninterrupted interval.");
            }
            if (!isStay && "CONTINUOUS".equals(pattern)) {
                BookingTimeInterval interval = requestedIntervals.get(0);
                if (!interval.getFrom().toLocalTime().equals(slot.getStartTime())
                        || !interval.getTo().toLocalTime().equals(slot.getEndTime())) {
                    throw new IllegalArgumentException("Continuous interval times must match the selected slot.");
                }
            }
            if (!isStay && "DAILY_RECURRING".equals(pattern)) {
                if (requestedIntervals.size() > 31) {
                    throw new IllegalArgumentException("Daily recurring bookings cannot exceed 31 sessions.");
                }
                for (BookingTimeInterval interval : requestedIntervals) {
                    if (!interval.getFrom().toLocalTime().equals(slot.getStartTime())) {
                        throw new IllegalArgumentException("Daily recurring interval start time does not match the selected slot.");
                    }
                    LocalDate expectedEndDate = interval.getFrom().toLocalDate();
                    if (!slot.getEndTime().isAfter(slot.getStartTime())) expectedEndDate = expectedEndDate.plusDays(1);
                    if (!interval.getTo().toLocalDate().equals(expectedEndDate)
                            || !interval.getTo().toLocalTime().equals(slot.getEndTime())) {
                        throw new IllegalArgumentException("Daily recurring interval end time does not match the selected slot.");
                    }
                }
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
        if (isBeauty && selectedPackage != null
                && (selectedPackage.getSlotIds() == null || selectedPackage.getSlotIds().isEmpty())) {
            throw new IllegalArgumentException("Assign at least one booking slot (for example, Morning or Evening) to this Beauty package.");
        }
        // Apply overlapping-customer duration validation only to individual
        // Beauty appointments. Fixed Beauty packages are governed by their
        // selected BookingSlot capacity, exactly like other package bookings.
        if (isBeauty && selectedPackage == null) {
            validateBeautyAppointment(service, request, null, requestedIntervals);
        }
        if (selectedPackage != null) {
            int durationUnits;
            String basis = selectedPackage.getPricingBasis() == null
                    ? "FIXED" : selectedPackage.getPricingBasis().toUpperCase(java.util.Locale.ROOT);
            int dateSpan = Math.max(1, (int) java.time.temporal.ChronoUnit.DAYS.between(
                    request.getBookingFrom().toLocalDate(), request.getBookingTo().toLocalDate()));
            durationUnits = (isStay || "PER_NIGHT".equals(basis) || requestedIntervals.size() == 1)
                    ? dateSpan : requestedIntervals.size();
            if ("FIXED_DURATION".equalsIgnoreCase(selectedPackage.getPackageType())) {
                Integer included = selectedPackage.getIncludedDuration();
                if (included == null || included < 1 || durationUnits != included) {
                    throw new IllegalArgumentException("The selected fixed-duration package must be booked for exactly "
                            + (included == null ? "its configured" : included) + " "
                            + (isStay ? "nights." : "days."));
                }
                if (isStay && effectiveRequirements(selectedPackage, request).isEmpty()) {
                    throw new IllegalArgumentException("The selected fixed-duration package must include at least one resource type.");
                }
            }
            int minDuration = selectedPackage.getMinimumDuration() == null ? 1 : selectedPackage.getMinimumDuration();
            int maxDuration = selectedPackage.getMaximumDuration() == null ? 31 : selectedPackage.getMaximumDuration();
            if (durationUnits < minDuration || durationUnits > maxDuration) {
                throw new IllegalArgumentException("Selected package booking duration must be between "
                        + minDuration + " and " + maxDuration + " " +
                        (("PER_NIGHT".equals(basis) || isStay) ? "nights." : "days."));
            }
        }
        // STAY and HALL use physical Resource Type inventory. Other categories
        // retain their existing slot/package capacity rules.
        String slotResourceTypeId = usesResourceTypes && slot != null ? slot.getResourceTypeId() : null;
        String packageResourceTypeId = usesResourceTypes && selectedPackage != null
                ? selectedPackage.getResourceTypeId() : null;
        String resourceTypeId = usesResourceTypes
                ? (request.getResourceTypeId() != null && !request.getResourceTypeId().isBlank()
                ? request.getResourceTypeId()
                : (packageResourceTypeId != null ? packageResourceTypeId : slotResourceTypeId))
                : null;
        List<ResourceTypeRequirement> resourceRequirements = usesResourceTypes
                ? effectiveRequirements(selectedPackage, request) : List.of();
        if (usesResourceTypes && resourceTypeId != null && !resourceTypeId.isBlank()) {
            if (packageResourceTypeId != null && !resourceTypeId.equals(packageResourceTypeId))
                throw new IllegalArgumentException("Selected package does not belong to the selected resource type.");
        }
        if (usesResourceTypes && slotResourceTypeId != null && !slotResourceTypeId.isBlank()
                && !resourceRequirements.isEmpty()
                && resourceRequirements.stream().noneMatch(r -> slotResourceTypeId.equals(r.getResourceTypeId()))) {
            throw new IllegalArgumentException("Selected slot resource type is not included in the selected package.");
        }
        if (!usesResourceTypes && ((request.getResourceRequirements() != null && !request.getResourceRequirements().isEmpty())
                || (selectedPackage != null && selectedPackage.getResourceRequirements() != null
                && !selectedPackage.getResourceRequirements().isEmpty())
                || (request.getResourceTypeId() != null && !request.getResourceTypeId().isBlank()))) {
            log.warn("Ignoring resource allocation fields for service without resource inventory. serviceId={} category={}",
                    request.getServiceId(), service.getCategory());
        }
        if (usesResourceTypes) {
            if (resourceRequirements.isEmpty()) {
                throw new IllegalArgumentException("The selected package must include at least one resource type.");
            }
            java.util.Set<String> seenTypes = new java.util.HashSet<>();
            for (ResourceTypeRequirement requirement : resourceRequirements) {
                if (requirement.getResourceTypeId() == null || requirement.getResourceTypeId().isBlank()
                        || requirement.getQuantity() == null || requirement.getQuantity() < 1
                        || !seenTypes.add(requirement.getResourceTypeId())) {
                    throw new IllegalArgumentException("Each package resource type must be unique and have a quantity of at least one.");
                }
            }
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
        // Catering slot capacity is measured in guests, not number of bookings.
        if (isCatering) {
            quantity = request.getGuestCount();
        }

        LocalDateTime now = LocalDateTime.now();
        List<String> holdResourceAllocation = new java.util.ArrayList<>();
        List<ResourceAllocation> holdAllocations = new java.util.ArrayList<>();
        if (slot != null) {
            if (isStay) {
                // Stay keeps its existing night-based slot-block validation.
                validateStaySlotNotBlocked(request.getServiceId(), slot, requestedIntervals);
            } else if (usesResourceTypes) {
                // Hall uses physical resource inventory. Do not run the legacy
                // slot-capacity check here: resource-type availability is
                // validated by allocateResourceUnits below.
                validateResourceSlotNotBlocked(request.getServiceId(), slot, requestedIntervals);
            } else {
                // Categories without physical resources retain legacy capacity validation.
                validateSlotCapacityForInterval(request.getServiceId(), slot,
                        request.getBookingFrom(), request.getBookingTo(), quantity, now);
            }
            if (usesResourceTypes) {
                for (ResourceTypeRequirement requirement : resourceRequirements) {
                    int requiredUnits = Math.multiplyExact(requirement.getQuantity(), isStay ? roomQuantity : 1);
                    List<String> allocated = allocateResourceUnits(request.getServiceId(), requirement.getResourceTypeId(),
                            requestedIntervals, requiredUnits, now);
                    if (allocated.size() < requiredUnits) {
                        throw new IllegalStateException("The selected package is no longer available: insufficient physical resources for one or more included resource types.");
                    }
                    ResourceAllocation allocation = new ResourceAllocation();
                    allocation.setResourceTypeId(requirement.getResourceTypeId());
                    allocation.setResourceIds(allocated);
                    holdAllocations.add(allocation);
                    holdResourceAllocation.addAll(allocated);
                }
                if (holdAllocations.size() == 1) {
                    resourceTypeId = holdAllocations.get(0).getResourceTypeId();
                } else {
                    resourceTypeId = null;
                }
            }
        } else if (!isBeauty) {
            throw new IllegalArgumentException("A valid booking slot is required.");
        }

        BookingHold hold = new BookingHold();
        hold.setServiceId(request.getServiceId());
        hold.setSlotId(slot == null ? null : slot.getId());
        hold.setPackageId(selectedPackage == null ? request.getPackageId() : selectedPackage.getId());
        hold.setSelectedBeautyServiceIds(isBeauty && request.getSelectedBeautyServiceIds() != null
                ? new java.util.ArrayList<>(request.getSelectedBeautyServiceIds()) : new java.util.ArrayList<>());
        hold.setResourceTypeId(resourceTypeId);
        hold.setResourceIds(holdResourceAllocation);
        hold.setResourceAllocations(holdAllocations);
        hold.setBookingFrom(request.getBookingFrom());
        hold.setBookingTo(request.getBookingTo());
        hold.setBookingIntervals(new java.util.ArrayList<>(requestedIntervals));
        hold.setBookingType(bookingType);
        hold.setRoomQuantity(isStay ? roomQuantity : request.getRoomQuantity());
        hold.setCartId(request.getCartId());
        hold.setQuantity(quantity);
        hold.setGuestCount(isCatering ? request.getGuestCount() : null);
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
                .resourceTypeId(savedHold.getResourceTypeId())
                .resourceIds(savedHold.getResourceIds())
                .resourceAllocations(savedHold.getResourceAllocations())
                .bookingFrom(savedHold.getBookingFrom())
                .bookingTo(savedHold.getBookingTo())
                .quantity(savedHold.getQuantity())
                .expiresAt(savedHold.getExpiresAt())
                .build();
    }

    private void validateBeautyAppointment(VendorService service, CreateBookingHoldRequest request,
                                           ServicePackage selectedPackage, List<BookingTimeInterval> intervals) {
        var details = service.getBeautyDetails();
        if (details == null || details.getOpeningTime() == null || details.getClosingTime() == null) {
            throw new IllegalArgumentException("Beauty shop hours are not configured.");
        }
        int capacity = service.getBookingSettings() == null || service.getBookingSettings().getMaxSimultaneousBookings() == null
                ? 0 : service.getBookingSettings().getMaxSimultaneousBookings();
        if (capacity < 1) throw new IllegalArgumentException("Maximum simultaneous customers must be configured for Beauty services.");
        int expectedDuration;
        if (selectedPackage != null) {
            int packageServiceCount = selectedPackage.getFeatures() == null ? 0 : selectedPackage.getFeatures().size();
            expectedDuration = selectedPackage.getDurationMinutes() != null ? selectedPackage.getDurationMinutes()
                    : (details.getDurationRules() == null ? 30 : details.getDurationRules().stream()
                    .filter(rule -> rule.getMinServices() != null && rule.getMaxServices() != null
                            && packageServiceCount >= rule.getMinServices() && packageServiceCount <= rule.getMaxServices())
                    .map(rule -> rule.getDurationMinutes() == null ? 0 : rule.getDurationMinutes()).findFirst().orElse(30));
        } else {
            List<String> ids = request.getSelectedBeautyServiceIds() == null ? List.of() : request.getSelectedBeautyServiceIds();
            if (ids.isEmpty()) throw new IllegalArgumentException("Select at least one Beauty service or a fixed package.");
            long distinct = ids.stream().filter(java.util.Objects::nonNull).distinct().count();
            if (distinct != ids.size()) throw new IllegalArgumentException("Duplicate Beauty services are not allowed.");
            long activeCount = details.getServices() == null ? 0 : details.getServices().stream()
                    .filter(item -> item.isActive() && ids.contains(item.getId())).count();
            if (activeCount != ids.size()) throw new IllegalArgumentException("One or more selected Beauty services are unavailable.");
            expectedDuration = details.getDurationRules() == null ? 0 : details.getDurationRules().stream()
                    .filter(rule -> rule.getMinServices() != null && rule.getMaxServices() != null
                            && ids.size() >= rule.getMinServices() && ids.size() <= rule.getMaxServices())
                    .map(rule -> rule.getDurationMinutes() == null ? 0 : rule.getDurationMinutes())
                    .findFirst().orElse(0);
        }
        if (expectedDuration < 1 || intervals.size() != 1
                || java.time.Duration.between(request.getBookingFrom(), request.getBookingTo()).toMinutes() != expectedDuration) {
            throw new IllegalArgumentException("Selected Beauty services/package does not match a configured appointment duration.");
        }
        LocalTime start = request.getBookingFrom().toLocalTime();
        LocalTime end = request.getBookingTo().toLocalTime();
        final int appointmentInterval = 30;
        long offsetMinutes = java.time.Duration.between(details.getOpeningTime(), start).toMinutes();
        if (appointmentInterval < 1 || offsetMinutes < 0 || offsetMinutes % appointmentInterval != 0) {
            throw new IllegalArgumentException("Select an appointment start time matching the configured start interval.");
        }
        if (!request.getBookingFrom().toLocalDate().equals(request.getBookingTo().toLocalDate())
                || start.isBefore(details.getOpeningTime()) || end.isAfter(details.getClosingTime())) {
            throw new IllegalArgumentException("Beauty appointment must fit within the shop opening hours on the selected date.");
        }
        if (details.getBreaks() != null && details.getBreaks().stream().anyMatch(b -> b.getStartTime() != null && b.getEndTime() != null
                && start.isBefore(b.getEndTime()) && end.isAfter(b.getStartTime()))) {
            throw new IllegalArgumentException("The selected Beauty appointment overlaps a shop break or blocked time.");
        }
        // Recheck overlapping bookings and live holds while the synchronized hold operation is executing.
        LocalDateTime now = LocalDateTime.now();
        List<Booking> existingBookings = bookingRepository.findByServiceId(service.getId());
        List<BookingHold> existingHolds = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                service.getId(), BookingHoldStatus.ACTIVE, now);
        int peakOccupied = peakBeautyOccupancy(request.getBookingFrom(), request.getBookingTo(), existingBookings, existingHolds);
        if (peakOccupied >= capacity) throw new IllegalStateException("This appointment time is no longer available. Please select another time.");
    }

    /** Returns the maximum number of existing Beauty appointments overlapping any instant in [from,to). */
    private int peakBeautyOccupancy(LocalDateTime from, LocalDateTime to,
                                    List<Booking> bookings, List<BookingHold> holds) {
        java.util.TreeMap<LocalDateTime, Integer> events = new java.util.TreeMap<>();
        if (bookings != null) {
            for (Booking booking : bookings) {
                if (booking == null || booking.getStatus() == BookingStatus.CANCELLED
                        || booking.getStatus() == BookingStatus.REJECTED
                        || booking.getPackageId() != null && !booking.getPackageId().isBlank()
                        || booking.getBookingFrom() == null || booking.getBookingTo() == null) continue;
                addBeautyOccupancyEvents(events, from, to, booking.getBookingFrom(), booking.getBookingTo());
            }
        }
        if (holds != null) {
            for (BookingHold hold : holds) {
                if (hold == null || hold.getPackageId() != null && !hold.getPackageId().isBlank()
                        || hold.getBookingFrom() == null || hold.getBookingTo() == null) continue;
                addBeautyOccupancyEvents(events, from, to, hold.getBookingFrom(), hold.getBookingTo());
            }
        }
        int current = 0;
        int peak = 0;
        for (Integer delta : events.values()) {
            current += delta;
            peak = Math.max(peak, current);
        }
        return peak;
    }

    private void addBeautyOccupancyEvents(java.util.TreeMap<LocalDateTime, Integer> events,
                                          LocalDateTime requestedFrom, LocalDateTime requestedTo,
                                          LocalDateTime existingFrom, LocalDateTime existingTo) {
        LocalDateTime overlapFrom = existingFrom.isAfter(requestedFrom) ? existingFrom : requestedFrom;
        LocalDateTime overlapTo = existingTo.isBefore(requestedTo) ? existingTo : requestedTo;
        if (!overlapFrom.isBefore(overlapTo)) return;
        events.merge(overlapFrom, 1, Integer::sum);
        events.merge(overlapTo, -1, Integer::sum);
    }

    private List<ResourceTypeRequirement> effectiveRequirements(ServicePackage selectedPackage,
                                                                CreateBookingHoldRequest request) {
        if (request.getResourceRequirements() != null && !request.getResourceRequirements().isEmpty()) {
            throw new IllegalArgumentException("Room composition is defined by the selected package and cannot be overridden during booking.");
        }
        if (selectedPackage != null && selectedPackage.getResourceRequirements() != null
                && !selectedPackage.getResourceRequirements().isEmpty()) {
            return new java.util.ArrayList<>(selectedPackage.getResourceRequirements());
        }
        String legacyTypeId = selectedPackage != null && selectedPackage.getResourceTypeId() != null
                ? selectedPackage.getResourceTypeId() : request.getResourceTypeId();
        if (legacyTypeId == null || legacyTypeId.isBlank()) return List.of();
        ResourceTypeRequirement legacy = new ResourceTypeRequirement();
        legacy.setResourceTypeId(legacyTypeId);
        legacy.setQuantity(1);
        return List.of(legacy);
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
        return calculateAvailability(serviceId, slot, date, now, null);
    }

    private SlotAvailabilityResponse calculateAvailability(
            String serviceId,
            BookingSlot slot,
            LocalDate date,
            LocalDateTime now,
            String requestedResourceTypeId
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

        boolean usesResourceTypes = vendorServiceRepository.findById(serviceId)
                .map(service -> service.getCategory() != null && service.getCategory().supportsResourceTypes())
                .orElse(false);
        String capacityResourceTypeId = requestedResourceTypeId != null && !requestedResourceTypeId.isBlank()
                ? requestedResourceTypeId : slot.getResourceTypeId();
        if (usesResourceTypes) {
            // STAY and HALL inventory is exclusively physical Resource Type inventory.
            // Slot maxBookings and capacity overrides must never limit physical resource count.
            // A slot-level block is still authoritative for the selected date.
            LocalDateTime from = slotStart(date, slot);
            LocalDateTime to = slotEnd(date, slot);
            boolean vendorBlocked = hasVendorBlock(serviceId, slot.getId(), date);
            boolean slotAlreadyStarted = !from.isAfter(now);
            int free = capacityResourceTypeId == null || capacityResourceTypeId.isBlank()
                    ? 0
                    : countFreeResourceUnits(serviceId, capacityResourceTypeId, from, to, now);
            int availableUnits = vendorBlocked || slotAlreadyStarted ? 0 : free;
            return SlotAvailabilityResponse.builder()
                    .slotId(slot.getId())
                    .serviceId(serviceId)
                    .slotName(slot.getSlotName())
                    .resourceTypeId(capacityResourceTypeId)
                    .bookingPattern(slot.getBookingPattern() == null ? "DAILY_RECURRING" : slot.getBookingPattern())
                    .date(date)
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .baseCapacity(availableUnits)
                    .effectiveCapacity(availableUnits)
                    .bookedCount(0)
                    .remainingCapacity(availableUnits)
                    .available(availableUnits > 0)
                    .vendorBlocked(vendorBlocked)
                    .build();
        }

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

        LocalDateTime scheduledSlotStart = slotStart(date, slot);
        boolean slotAlreadyStarted = !scheduledSlotStart.isAfter(now);
        int availableCount = slotAlreadyStarted ? 0 :
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
                .resourceTypeId(slot.getResourceTypeId())
                .bookingPattern(slot.getBookingPattern() == null ? "DAILY_RECURRING" : slot.getBookingPattern())
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
    private void validateStaySlotNotBlocked(String serviceId, BookingSlot slot,
                                            List<BookingTimeInterval> intervals) {
        for (BookingTimeInterval interval : intervals) {
            LocalDate date = interval.getFrom().toLocalDate();
            LocalDate endDate = interval.getTo().toLocalDate();
            while (date.isBefore(endDate)) {
                if (hasVendorBlock(serviceId, slot.getId(), date)) {
                    throw new IllegalStateException("The selected booking slot is blocked by the vendor on " + date + ".");
                }
                date = date.plusDays(1);
            }
        }
    }

    /**
     * Hall/resource-type bookings use physical inventory rather than the
     * legacy slot maxBookings/capacity calculation. Still honour vendor
     * blocks for every calendar date touched by each requested interval.
     *
     * Intervals are half-open [from, to), so subtracting one nanosecond from
     * the end avoids treating a midnight checkout/end boundary as another day.
     */
    private void validateResourceSlotNotBlocked(String serviceId, BookingSlot slot,
                                                List<BookingTimeInterval> intervals) {
        for (BookingTimeInterval interval : intervals) {
            LocalDate date = interval.getFrom().toLocalDate();
            LocalDate lastOccupiedDate = interval.getTo().minusNanos(1).toLocalDate();
            while (!date.isAfter(lastOccupiedDate)) {
                if (hasVendorBlock(serviceId, slot.getId(), date)) {
                    throw new IllegalStateException(
                            "The selected booking slot is blocked by the vendor on " + date + ".");
                }
                date = date.plusDays(1);
            }
        }
    }

    private List<String> allocateResourceUnits(String serviceId, String resourceTypeId,
                                               List<BookingTimeInterval> intervals,
                                               int quantity, LocalDateTime now) {
        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor service not found."));
        ServiceResourceType type = service.getResourceTypes() == null ? null : service.getResourceTypes().stream()
                .filter(t -> resourceTypeId.equals(t.getId()) && !Boolean.FALSE.equals(t.getActive()))
                .findFirst().orElse(null);
        if (type == null) throw new IllegalArgumentException("Selected resource type is not active.");
        List<String> free = new java.util.ArrayList<>();
        List<ServiceResourceUnit> units = type.getUnits() == null ? List.of() : type.getUnits();
        for (ServiceResourceUnit unit : units) {
            if (unit.getId() == null || Boolean.FALSE.equals(unit.getActive())) continue;
            boolean booked = bookingRepository.findByServiceId(serviceId).stream()
                    .filter(this::countsAgainstAvailability)
                    .filter(b -> resourceTypeId.equals(b.getResourceTypeId())
                            || (b.getResourceAllocations() != null && b.getResourceAllocations().stream()
                            .anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId()))))
                    .filter(b -> overlapsAny(b.getBookingIntervals(), b.getBookingFrom(), b.getBookingTo(), intervals))
                    .anyMatch(b -> (resourceTypeId.equals(b.getResourceTypeId()) && b.getResourceIds() != null
                            && b.getResourceIds().contains(unit.getId())) || (b.getResourceAllocations() != null
                            && b.getResourceAllocations().stream().anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId())
                            && a.getResourceIds() != null && a.getResourceIds().contains(unit.getId()))));
            boolean held = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                            serviceId, BookingHoldStatus.ACTIVE, now).stream()
                    .filter(h -> resourceTypeId.equals(h.getResourceTypeId())
                            || (h.getResourceAllocations() != null && h.getResourceAllocations().stream()
                            .anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId()))))
                    .filter(h -> overlapsAny(h.getBookingIntervals(), h.getBookingFrom(), h.getBookingTo(), intervals))
                    .anyMatch(h -> (resourceTypeId.equals(h.getResourceTypeId()) && h.getResourceIds() != null
                            && h.getResourceIds().contains(unit.getId())) || (h.getResourceAllocations() != null
                            && h.getResourceAllocations().stream().anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId())
                            && a.getResourceIds() != null && a.getResourceIds().contains(unit.getId()))));
            if (!booked && !held) free.add(unit.getId());
            if (free.size() >= quantity) break;
        }
        return free;
    }

    private int countFreeResourceUnits(String serviceId, String resourceTypeId,
                                       LocalDateTime from, LocalDateTime to, LocalDateTime now) {
        VendorService service = vendorServiceRepository.findById(serviceId).orElse(null);
        if (service == null || service.getResourceTypes() == null) return 0;
        ServiceResourceType type = service.getResourceTypes().stream()
                .filter(t -> resourceTypeId.equals(t.getId()) && !Boolean.FALSE.equals(t.getActive()))
                .findFirst().orElse(null);
        if (type == null || type.getUnits() == null) return 0;
        int count = 0;
        for (ServiceResourceUnit unit : type.getUnits()) {
            if (unit.getId() == null || Boolean.FALSE.equals(unit.getActive())) continue;
            boolean booked = bookingRepository.findByServiceId(serviceId).stream()
                    .filter(this::countsAgainstAvailability)
                    .filter(b -> resourceTypeId.equals(b.getResourceTypeId())
                            || (b.getResourceAllocations() != null && b.getResourceAllocations().stream()
                            .anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId()))))
                    .filter(b -> overlapsAny(b.getBookingIntervals(), b.getBookingFrom(), b.getBookingTo(),
                            List.of(new BookingTimeInterval(from, to))))
                    .anyMatch(b -> (resourceTypeId.equals(b.getResourceTypeId()) && b.getResourceIds() != null
                            && b.getResourceIds().contains(unit.getId())) || (b.getResourceAllocations() != null
                            && b.getResourceAllocations().stream().anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId())
                            && a.getResourceIds() != null && a.getResourceIds().contains(unit.getId()))));
            boolean held = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                            serviceId, BookingHoldStatus.ACTIVE, now).stream()
                    .filter(h -> resourceTypeId.equals(h.getResourceTypeId())
                            || (h.getResourceAllocations() != null && h.getResourceAllocations().stream()
                            .anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId()))))
                    .filter(h -> overlapsAny(h.getBookingIntervals(), h.getBookingFrom(), h.getBookingTo(),
                            List.of(new BookingTimeInterval(from, to))))
                    .anyMatch(h -> (resourceTypeId.equals(h.getResourceTypeId()) && h.getResourceIds() != null
                            && h.getResourceIds().contains(unit.getId())) || (h.getResourceAllocations() != null
                            && h.getResourceAllocations().stream().anyMatch(a -> resourceTypeId.equals(a.getResourceTypeId())
                            && a.getResourceIds() != null && a.getResourceIds().contains(unit.getId()))));
            if (!booked && !held) count++;
        }
        return count;
    }

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
                    throw new IllegalStateException(isStay
                            ? "Not enough rooms are available for the entire requested stay. Please reduce the room count or choose different dates/slot."
                            : "Not enough physical resources are available for the selected booking interval. Choose another date or slot.");
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

        VendorService service = vendorServiceRepository.findById(serviceId).orElse(null);
        boolean isStay = service != null && service.getCategory() == ServiceCategory.STAY;
        boolean isCatering = service != null && service.getCategory() != null
                && "CATERING".equalsIgnoreCase(service.getCategory().name());

        LocalDateTime requestedFrom = slotStart(date, slot);
        LocalDateTime requestedTo = slotEnd(date, slot);

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
                .mapToInt(b -> isCatering
                        ? (b.getGuestCount() == null ? 1 : Math.max(1, b.getGuestCount()))
                        : (b.getRoomQuantity() != null ? b.getRoomQuantity() : 1))
                .sum();
    }

    private boolean overlapsAny(List<BookingTimeInterval> savedIntervals,
                                LocalDateTime fallbackFrom, LocalDateTime fallbackTo,
                                List<BookingTimeInterval> requestedIntervals) {
        List<BookingTimeInterval> existing = savedIntervals == null || savedIntervals.isEmpty()
                ? List.of(new BookingTimeInterval(fallbackFrom, fallbackTo))
                : savedIntervals;
        for (BookingTimeInterval a : existing) {
            if (a == null) continue;
            for (BookingTimeInterval b : requestedIntervals) {
                if (b != null && intervalsOverlap(a.getFrom(), a.getTo(), b.getFrom(), b.getTo())) return true;
            }
        }
        return false;
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

        VendorService service = vendorServiceRepository.findById(serviceId).orElse(null);
        boolean isStay = service != null && service.getCategory() == ServiceCategory.STAY;
        boolean isCatering = service != null && service.getCategory() != null
                && "CATERING".equalsIgnoreCase(service.getCategory().name());

        LocalDateTime requestedFrom = slotStart(date, slot);
        LocalDateTime requestedTo = slotEnd(date, slot);
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
                .mapToInt(h -> isCatering
                        ? (h.getGuestCount() == null
                        ? (h.getQuantity() == null ? 0 : Math.max(0, h.getQuantity()))
                        : Math.max(0, h.getGuestCount()))
                        : (h.getQuantity() == null ? 0 : Math.max(0, h.getQuantity())))
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
