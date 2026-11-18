package com.booking.service.impl;

import com.booking.dto.booking.*;
import com.booking.dto.bundle.BundleCalculationItemRequest;
import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;
import com.booking.dto.bundle.BundleDiscountItem;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.exception.BookingNotFoundException;
import com.booking.exception.ExpiredBookingHoldException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.helper.BookingHelper;
import com.booking.mapper.BookingMapper;
import com.booking.model.*;
import com.booking.model.embedded.*;
import com.booking.model.enums.BookingHoldStatus;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.DiscountType;
import com.booking.model.enums.NotificationType;
import com.booking.model.enums.PaymentStatus;
import com.booking.model.enums.VendorPage;
import com.booking.repository.*;
import com.booking.service.*;
import com.booking.util.BookingNumberGenerator;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService
{

    private final BookingRepository bookingRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository vendorRepository;

    private final AuthenticatedUserService authenticatedUserService;
    private final VendorAccessService vendorAccessService;
    private final VendorPermissionService vendorPermissionService;

    private final BookingNumberGenerator bookingNumberGenerator;

    private final BookingMapper bookingMapper;

    private final BookingHelper bookingHelper;

    private final NotificationService notificationService;

    private final PricingCalculationService pricingCalculationService;

    private final UserRepository userRepository;

    private final ServiceSettingsRepository serviceSettingsRepository;

    private final VendorServicePricingRepository pricingRepository;

    private final BundleCalculationService bundleCalculationService;

    private final BundleRepository bundleRepository;

    /*
     * Booking holds are validated again at final booking creation.
     * This prevents a customer from continuing with a cart item
     * whose temporary hold has already expired.
     */
    private final BookingHoldRepository bookingHoldRepository;

    private final BookingSlotRepository bookingSlotRepository;

    @Override
    public BookingGroupResponse createBooking(
            CreateBookingRequest request
    ) {

        /*
         * =========================================
         * 1. GET AUTHENTICATED CUSTOMER
         * =========================================
         */

        User customer =
                authenticatedUserService
                        .getCurrentUser();

        log.info("Creating booking group customerId={} serviceCount={} bundleCount={}",
                customer.getId(),
                request.getServices() == null ? 0 : request.getServices().size(),
                request.getBundles() == null ? 0 : request.getBundles().size());


        /*
         * =========================================
         * 2. GENERATE BOOKING GROUP
         * =========================================
         *
         * Every service selected during one checkout
         * belongs to the same booking group.
         */

        String bookingGroupId =
                java.util.UUID.randomUUID()
                        .toString();


        /*
         * =========================================
         * 3. PREPARE ALL SERVICE ITEMS
         * =========================================
         *
         * Both:
         *
         * request.services
         *
         * and
         *
         * request.bundles[].items
         *
         * use the same BookingServiceItemRequest.
         */

        List<BookingServiceItemRequest> allServiceItems =
                new java.util.ArrayList<>();


        /*
         * =========================================
         * 3A. SERVICE ITEM -> BUNDLE MAP
         * =========================================
         *
         * Key:
         *
         *     serviceId + eventDate
         *
         * Value:
         *
         *     bundleId
         *
         * We use both serviceId and eventDate because
         * the same service can be booked on different
         * dates.
         */

        Map<String, String> serviceItemBundleMap =
                new java.util.HashMap<>();


        /* Bundle configuration by bundle ID. */
        Map<String, Bundle> bundleDetailsMap =
                new java.util.HashMap<>();


        /*
         * =========================================
         * 3B. PROCESS BUNDLES
         * =========================================
         */

        if (request.getBundles() != null) {

            for (
                    BookingBundleItemRequest bundleRequest :
                    request.getBundles()
            ) {

                if (
                        bundleRequest.getItems() == null ||
                                bundleRequest.getItems().isEmpty()
                ) {

                    continue;
                }


                String bundleId =
                        bundleRequest.getBundleId();


                if (bundleId == null || bundleId.isBlank()) {

                    throw new IllegalArgumentException(
                            "Bundle ID is required for bundle booking."
                    );
                }


                Bundle bundle =
                        bundleRepository
                                .findById(bundleId)
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Bundle not found: "
                                                        + bundleId
                                        )
                                );


                bundleDetailsMap.put(
                        bundleId,
                        bundle
                );


                /*
                 * Add every service from this bundle.
                 */

                for (
                        BookingServiceItemRequest item :
                        bundleRequest.getItems()
                ) {

                    allServiceItems.add(item);


                    /*
                     * Create unique key for this booking item.
                     *
                     * Example:
                     *
                     * service123_2026-09-20
                     */

                    String key = bookingServiceItemKey(item);


                    /*
                     * Remember which bundle this
                     * service/date belongs to.
                     */

                    serviceItemBundleMap.put(
                            key,
                            bundleId
                    );
                }
            }
        }


        /*
         * =========================================
         * 3C. PROCESS INDIVIDUAL SERVICES
         * =========================================
         */

        if (request.getServices() != null) {

            allServiceItems.addAll(
                    request.getServices()
            );
        }


        /*
         * =========================================
         * 4. DISTINCT SERVICE ITEMS
         * =========================================
         *
         * IMPORTANT:
         *
         * We cannot use only serviceId.
         *
         * The same service can be booked on
         * different dates.
         *
         * Therefore:
         *
         *     serviceId + eventDate
         *
         * identifies a booking item.
         */

        for (BookingServiceItemRequest item : allServiceItems) {
            if (item.getBookingFrom() == null || item.getBookingTo() == null
                    || !item.getBookingFrom().isBefore(item.getBookingTo())) {
                throw new IllegalArgumentException("Booking end must be after booking start.");
            }
            if ("ROOM_STAY".equals(item.getBookingType())
                    && (item.getRoomQuantity() == null || item.getRoomQuantity() < 1)) {
                throw new IllegalArgumentException("At least one room must be selected.");
            }
        }

        List<BookingServiceItemRequest> serviceItems =
                allServiceItems
                        .stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        BookingServiceImpl::bookingServiceItemKey,

                                        item -> item,

                                        (first, second) -> first
                                )
                        )
                        .values()
                        .stream()
                        .toList();


        if (serviceItems.isEmpty()) {

            log.warn("Booking creation rejected: no service items customerId={}",
                    customer.getId());

            throw new IllegalArgumentException(
                    "At least one service is required."
            );
        }

        log.debug("Prepared booking items bookingGroupId={} distinctServiceItems={}",
                bookingGroupId,
                serviceItems.size());


        /*
         * =========================================
         * 4A. VALIDATE BOOKING HOLDS
         * =========================================
         *
         * A cart can remain open for longer than the
         * five-minute temporary hold. Therefore the
         * hold must be checked again on the server when
         * the customer actually creates the booking.
         *
         * IMPORTANT:
         *
         * This validation happens for ALL cart items
         * before any Booking document is created.
         * That prevents a partially-created booking group
         * if one item has an expired/missing hold.
         *
         * We validate each service item independently.
         * One expired hold does not invalidate the other
         * items in the cart conceptually; the checkout layer
         * should remove/flag that individual item. This
         * final check is the last server-side safety net.
         */

        validateActiveBookingHolds(
                serviceItems,
                customer.getId()
        );

        /*
         * =========================================
         * 5. FIND SERVICES
         * =========================================
         *
         * Fetch each actual VendorService only once.
         */

        Map<String, VendorService> serviceMap =
                serviceItems
                        .stream()
                        .map(
                                BookingServiceItemRequest
                                        ::getServiceId
                        )
                        .distinct()
                        .map(
                                serviceId ->
                                        vendorServiceRepository
                                                .findByIdAndActiveTrueAndDeletedFalse(
                                                        serviceId
                                                )
                                                .orElseThrow(() ->
                                                        new ResourceNotFoundException(
                                                                "Service not found: "
                                                                        + serviceId
                                                        )
                                                )
                        )
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        VendorService::getId,
                                        service -> service
                                )
                        );


        /*
         * =========================================
         * 6. PREPARE RESPONSE DATA
         * =========================================
         */

        List<BookingResponse> bookingResponses =
                new java.util.ArrayList<>();


        BigDecimal originalTotal =
                BigDecimal.ZERO;


        BigDecimal totalDiscount =
                BigDecimal.ZERO;
        BigDecimal individualDiscountTotal = BigDecimal.ZERO;
        BigDecimal bundleDiscountTotal = BigDecimal.ZERO;


        BigDecimal finalTotal =
                BigDecimal.ZERO;


        boolean bundleApplied =
                false;


        int qualifyingServiceCount =
                0;


        /*
         * =========================================
         * 7. PREPARE BUNDLE REQUESTS
         * =========================================
         */

        List<BookingBundleItemRequest> bundleRequests =
                request.getBundles() != null
                        ? request.getBundles()
                        : java.util.Collections.emptyList();


        /*
         * =========================================
         * 8. PRE-CALCULATE BUNDLE DISCOUNTS
         * =========================================
         *
         * Each bundle is calculated once.
         *
         * Bundle discount is stored against the
         * individual service ID.
         */

        Map<String, BigDecimal> bundleDiscountMap =
                new java.util.HashMap<>();


        for (
                BookingBundleItemRequest bundleRequest :
                bundleRequests
        ) {

            if (
                    bundleRequest.getItems() == null ||
                            bundleRequest.getItems().isEmpty()
            ) {

                continue;
            }


            /*
             * Get unique service IDs belonging
             * to this bundle.
             */

            List<String> bundleServiceIds =
                    bundleRequest
                            .getItems()
                            .stream()
                            .map(
                                    BookingServiceItemRequest
                                            ::getServiceId
                            )
                            .distinct()
                            .toList();


            /*
             * Need at least two services for
             * a bundle.
             */

            if (bundleServiceIds.size() < 2) {

                continue;
            }


            /*
             * =========================================
             * VERIFY SAME VENDOR
             * =========================================
             */

            List<VendorService> bundleServices =
                    bundleServiceIds
                            .stream()
                            .map(serviceMap::get)
                            .filter(
                                    java.util.Objects::nonNull
                            )
                            .toList();


            if (bundleServices.isEmpty()) {

                continue;
            }


            String firstVendorId =
                    bundleServices
                            .get(0)
                            .getVendorId();


            boolean sameVendor =
                    bundleServices
                            .stream()
                            .allMatch(
                                    service ->
                                            service
                                                    .getVendorId()
                                                    .equals(
                                                            firstVendorId
                                                    )
                            );


            if (!sameVendor) {

                continue;
            }


            /*
             * =========================================
             * CALCULATE BUNDLE
             * =========================================
             */

            BundleCalculationRequest bundleCalculationRequest =
                    new BundleCalculationRequest();


            List<BundleCalculationItemRequest> bundleCalculationItems =
                    bundleRequest
                            .getItems()
                            .stream()
                            .map(item -> {

                                BundleCalculationItemRequest calculationItem =
                                        new BundleCalculationItemRequest();

                                calculationItem.setServiceId(
                                        item.getServiceId()
                                );

                                calculationItem.setPackageId(
                                        item.getPackageId()
                                );

                                calculationItem.setBookingFrom(
                                        item.getBookingFrom()
                                );
                                calculationItem.setBookingTo(
                                        item.getBookingTo()
                                );
                                calculationItem.setGuestCount(item.getGuestCount());
                                calculationItem.setRoomQuantity(item.getRoomQuantity());

                                return calculationItem;

                            })
                            .toList();

            bundleCalculationRequest.setBundleId(
                    bundleRequest.getBundleId()
            );

            bundleCalculationRequest.setItems(
                    bundleCalculationItems
            );


            BundleCalculationResponse bundleResult =
                    bundleCalculationService
                            .calculateBundle(
                                    bundleCalculationRequest
                            );


            if (
                    bundleResult == null ||
                            bundleResult.getItems() == null
            ) {

                continue;
            }


            /*
             * =========================================
             * STORE BUNDLE DISCOUNTS
             * =========================================
             */

            java.util.Set<String> matchedBundleItemKeys = new java.util.HashSet<>();
            for (
                    BundleDiscountItem bundleItem :
                    bundleResult.getItems()
            ) {

                BigDecimal discount =
                        safe(
                                bundleItem.getDiscountAmount()
                        );


                if (
                        discount.compareTo(
                                BigDecimal.ZERO
                        ) > 0
                ) {

                    BookingServiceItemRequest matchingItem =
                            bundleRequest.getItems().stream()
                                    .filter(item -> Objects.equals(item.getServiceId(), bundleItem.getServiceId()))
                                    .filter(item -> !matchedBundleItemKeys.contains(bookingServiceItemKey(item)))
                                    .findFirst()
                                    .orElse(null);


                    if (matchingItem != null) {

                        String discountKey = bookingServiceItemKey(matchingItem);
                        matchedBundleItemKeys.add(discountKey);

                        bundleDiscountMap.merge(
                                discountKey,
                                discount,
                                BigDecimal::add
                        );
                    }

                    bundleApplied = true;
                }
            }


            qualifyingServiceCount =
                    Math.max(
                            qualifyingServiceCount,
                            bundleResult
                                    .getQualifyingServiceCount()
                    );
        }


        /*
         * =========================================
         * 9. CREATE BOOKINGS
         * =========================================
         */

        for (
                BookingServiceItemRequest item :
                serviceItems
        ) {

            /*
             * =========================================
             * FIND ACTUAL VENDOR SERVICE
             * =========================================
             */

            VendorService vendorService =
                    serviceMap.get(
                            item.getServiceId()
                    );
            if (vendorService == null) {

                throw new ResourceNotFoundException(
                        "Service not found: "
                                + item.getServiceId()
                );
            }

            /*
             * =========================================
             * FIND VENDOR
             * =========================================
             */

            User vendor =
                    vendorRepository
                            .findById(
                                    vendorService.getVendorId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Vendor not found."
                                    )
                            );


            /*
             * =========================================
             * CALCULATE SERVICE PRICING
             * =========================================
             *
             * Each service item has its own date.
             */

            PricingCalculationResult pricingResult =
                    pricingCalculationService.calculatePrice(
                            vendorService.getId(),
                            item.getBookingFrom().toLocalDate(),
                            item.getPackageId(),
                            item.getGuestCount()
                    );

            ServicePackage selectedPackage =
                    resolvePackage(
                            vendorService,
                            item.getPackageId(),
                            item.getBookingFrom().toLocalDate()
                    );

            validatePackageSlot(vendorService, selectedPackage, item);
            if (vendorService.getCategory() == com.booking.model.enums.ServiceCategory.STAY) {
                int combinations = item.getRoomQuantity() == null ? 1 : item.getRoomQuantity();
                int roomsPerCombination = selectedPackage.getResourceRequirements() == null
                        || selectedPackage.getResourceRequirements().isEmpty() ? 1
                        : selectedPackage.getResourceRequirements().stream()
                        .mapToInt(requirement -> requirement.getQuantity() == null ? 0 : requirement.getQuantity())
                        .sum();
                int guestsPerRoom = selectedPackage.getMaxGuestsPerRoom();
                int maxGuests = Math.multiplyExact(Math.multiplyExact(combinations, roomsPerCombination), guestsPerRoom);
                if (item.getGuestCount() != null && item.getGuestCount() > maxGuests) {
                    throw new IllegalArgumentException(
                            "Guest count exceeds the selected package capacity of " + maxGuests + " guests across " + (combinations * roomsPerCombination) + " room(s).");
                }
            }

            BigDecimal serviceTotal = safe(pricingResult.getTotalAmount());
            int stayPriceMultiplier = 1;
            if (vendorService.getCategory() == com.booking.model.enums.ServiceCategory.STAY) {
                int packageQuantity = item.getRoomQuantity() == null ? 1 : item.getRoomQuantity();
                int stayNights = Math.max(1, (int) java.time.temporal.ChronoUnit.DAYS.between(
                        item.getBookingFrom().toLocalDate(), item.getBookingTo().toLocalDate()));
                boolean fixedDuration = selectedPackage != null
                        && "FIXED_DURATION".equalsIgnoreCase(selectedPackage.getPackageType());
                boolean durationPriced = selectedPackage != null
                        && ("PER_NIGHT".equalsIgnoreCase(selectedPackage.getPricingBasis())
                        || "PER_DAY".equalsIgnoreCase(selectedPackage.getPricingBasis()));
                int durationMultiplier = !fixedDuration && durationPriced ? stayNights : 1;
                stayPriceMultiplier = Math.multiplyExact(packageQuantity, durationMultiplier);
                // The package price is for one complete room composition, per
                // night where configured. Quantity means complete combinations.
                serviceTotal = serviceTotal.multiply(BigDecimal.valueOf(stayPriceMultiplier));
            }


            /*
             * =========================================
             * FIND BUNDLE ID FOR THIS BOOKING
             * =========================================
             *
             * IMPORTANT:
             *
             * Use serviceId + eventDate.
             *
             * This allows:
             *
             * service123 + 2026-09-20
             *
             * to belong to one bundle while
             *
             * service123 + 2026-09-22
             *
             * can belong to another bundle.
             */

            String serviceItemKey = bookingServiceItemKey(item);


            String bundleId =
                    serviceItemBundleMap.get(
                            serviceItemKey
                    );


            /*
             * =========================================
             * BUNDLE DISCOUNT
             * =========================================
             */

            String discountKey = bookingServiceItemKey(item);
            if (bundleId != null) {
                BigDecimal preDiscountAmount = safe(pricingResult.getSubtotal());
                if (vendorService.getCategory() == com.booking.model.enums.ServiceCategory.STAY) {
                    preDiscountAmount = preDiscountAmount.multiply(BigDecimal.valueOf(stayPriceMultiplier));
                }
                serviceTotal = preDiscountAmount;
            }

            BigDecimal bundleDiscount =
                    bundleDiscountMap.getOrDefault(
                            discountKey,
                            BigDecimal.ZERO
                    );

            /*
             * =========================================
             * FINAL SERVICE AMOUNT
             * =========================================
             */

            BigDecimal finalServiceAmount =
                    serviceTotal
                            .subtract(
                                    bundleDiscount
                            )
                            .max(
                                    BigDecimal.ZERO
                            );


            /*
             * =========================================
             * CREATE BOOKING
             * =========================================
             */

            Booking booking =
                    new Booking();


            booking.setBookingNumber(
                    bookingNumberGenerator.generate()
            );


            booking.setBookingGroupId(
                    bookingGroupId
            );


            booking.setCustomerId(
                    customer.getId()
            );


            booking.setBookingFrom(item.getBookingFrom());
            booking.setBookingTo(item.getBookingTo());
            // Persist the exact slot selected in the cart/checkout request.
            // Availability uses this field to charge capacity to only that slot.
            booking.setSlotId(item.getSlotId());
            if (item.getSlotId() != null && !item.getSlotId().isBlank()) {
                BookingSlot selectedSlot = bookingSlotRepository
                        .findById(item.getSlotId())
                        .orElse(null);
                if (selectedSlot != null) {
                    booking.setSlotName(selectedSlot.getSlotName());
                    booking.setSlotStartTime(selectedSlot.getStartTime() == null
                            ? null : selectedSlot.getStartTime().toString());
                    booking.setSlotEndTime(selectedSlot.getEndTime() == null
                            ? null : selectedSlot.getEndTime().toString());
                }
            }
            if (item.getHoldId() != null && !item.getHoldId().isBlank()) {
                java.util.Optional<BookingHold> holdOptional =
                        bookingHoldRepository.findById(item.getHoldId());
                if (holdOptional.isPresent()) {
                    BookingHold hold = holdOptional.get();
                    booking.setResourceTypeId(hold.getResourceTypeId());
                    booking.setResourceIds(hold.getResourceIds() == null
                            ? new java.util.ArrayList<>() : new java.util.ArrayList<>(hold.getResourceIds()));
                    booking.setResourceAllocations(hold.getResourceAllocations() == null
                            ? new java.util.ArrayList<>() : new java.util.ArrayList<>(hold.getResourceAllocations()));
                    booking.setBookingIntervals(hold.getBookingIntervals() == null
                            ? new java.util.ArrayList<>()
                            : new java.util.ArrayList<>(hold.getBookingIntervals()));
                }
            }
            boolean stayBooking = vendorService.getCategory() == com.booking.model.enums.ServiceCategory.STAY;
            booking.setBookingType(stayBooking ? "ROOM_STAY"
                    : (item.getBookingType() == null ? "STANDARD_SLOT" : item.getBookingType()));
            booking.setRoomTypeId(null);
            booking.setRoomQuantity(item.getRoomQuantity() == null ? 1 : item.getRoomQuantity());


            booking.setGuestCount(
                    item.getGuestCount()
            );


            booking.setSpecialRequest(
                    request.getSpecialRequest()
            );


            booking.setEventType(
                    request.getEventType()
            );


            /*
             * =========================================
             * BUNDLE ID
             * =========================================
             *
             * null  -> individual service
             *
             * value -> service booked as part
             *          of this bundle
             */

            booking.setBundleId(
                    bundleId
            );

            /*
             * =========================================
             * PACKAGE SNAPSHOT REFERENCE
             * =========================================
             */

            booking.setPackageId(
                    selectedPackage != null
                            ? selectedPackage.getId()
                            : null
            );

            booking.setSelectedCateringDishes(
                    toBookingSelectedCateringDishes(item)
            );

            booking.setPackageType(
                    selectedPackage != null
                            ? selectedPackage.getName()
                            : null
            );


            /*
             * =========================================
             * SNAPSHOTS
             * =========================================
             */

            bookingHelper.prepareBooking(
                    booking,
                    vendorService,
                    customer,
                    vendor
            );


            BookingPricingSnapshot pricingSnapshot = createPricingSnapshot(pricingResult);
            if (vendorService.getCategory() == com.booking.model.enums.ServiceCategory.STAY) {
                scaleStayPricingSnapshot(pricingSnapshot, stayPriceMultiplier);
            }

            Bundle bookingBundle =
                    bundleId == null
                            ? null
                            : bundleDetailsMap.get(
                            bundleId
                    );

            if (selectedPackage != null) {

                pricingSnapshot.setPackageId(
                        selectedPackage.getId()
                );

                pricingSnapshot.setPackageType(
                        selectedPackage.getName()
                );

                pricingSnapshot.setPackagePrice(
                        selectedPackage.getPrice()
                );

                pricingSnapshot.setPackageFeatures(
                        selectedPackage.getFeatures()
                );
            }
            /*
             * Add bundle discount to the
             * existing pricing discount.
             */

            BigDecimal existingDiscount = bundleId == null
                    ? safe(pricingSnapshot.getDiscountAmount())
                    : BigDecimal.ZERO;
            if (bundleId != null) {
                // Bundled services retain all payment heads, but individual
                // service discounts are intentionally excluded.
                pricingSnapshot.setDiscounts(new java.util.ArrayList<>());
                pricingSnapshot.setDiscountAmount(BigDecimal.ZERO);
                pricingSnapshot.setTotalAmount(safe(pricingSnapshot.getSubtotal()));
            }
            pricingSnapshot.setDiscountAmount(existingDiscount.add(bundleDiscount));


            if (
                    bundleDiscount.compareTo(
                            BigDecimal.ZERO
                    ) > 0 &&
                            bookingBundle != null
            ) {

                BookingDiscountSnapshot bundleSnapshot =
                        new BookingDiscountSnapshot();


                bundleSnapshot.setName(
                        "Bundle Discount"
                );
                bundleSnapshot.setDiscountType(
                        DiscountType.valueOf(
                                bookingBundle
                                        .getDiscountType()
                                        .toUpperCase()
                        )
                );
                bundleSnapshot.setValue(
                        bookingBundle.getDiscountValue()
                );

                bundleSnapshot.setCalculatedAmount(
                        bundleDiscount
                );


                List<BookingDiscountSnapshot> existingDiscounts =
                        pricingSnapshot.getDiscounts() == null
                                ? new java.util.ArrayList<>()
                                : new java.util.ArrayList<>(
                                pricingSnapshot.getDiscounts()
                        );


                existingDiscounts.add(
                        bundleSnapshot
                );


                pricingSnapshot.setDiscounts(
                        existingDiscounts
                );

            }

            /*
             * Store final amount after
             * bundle discount.
             */

            pricingSnapshot.setTotalAmount(
                    finalServiceAmount
            );


            booking.setPricingSnapshot(
                    pricingSnapshot
            );


            /*
             * =========================================
             * TOP LEVEL TOTALS
             * =========================================
             */

            booking.setTotalAmount(
                    finalServiceAmount
            );


            booking.setPaidAmount(
                    BigDecimal.ZERO
            );


            /*booking.setCreatedTs(
                    LocalDateTime.now()
            );*/


            /*
             * =========================================
             * SAVE BOOKING
             * =========================================
             */

            booking =
                    bookingRepository.save(
                            booking
                    );

            log.info("Booking created bookingId={} bookingNumber={} bookingGroupId={} customerId={} vendorId={} serviceId={} eventDate={} bundleId={}",
                    booking.getId(),
                    booking.getBookingNumber(),
                    bookingGroupId,
                    customer.getId(),
                    booking.getVendorId(),
                    booking.getServiceId(),
                    booking.getBookingFrom().toLocalDate(),
                    booking.getBundleId());


            /*
             * =========================================
             * VENDOR NOTIFICATION
             * =========================================
             */

            notificationService.createNotification(

                    vendor.getId(),

                    NotificationType.BOOKING,

                    "New Booking",

                    customer.getFullName()
                            + " booked "
                            + booking.getServiceName(),

                    booking.getId()
            );


            /*
             * =========================================
             * RESPONSE
             * =========================================
             */

            bookingResponses.add(
                    bookingMapper.toResponse(
                            booking
                    )
            );


            /*
             * =========================================
             * GROUP TOTALS
             * =========================================
             */
            originalTotal =
                    originalTotal.add(
                            safe(
                                    pricingSnapshot.getSubtotal()
                            )
                    );


            totalDiscount =
                    totalDiscount.add(
                            safe(
                                    pricingSnapshot.getDiscountAmount()
                            )
                    );
            if (bundleId != null) {
                bundleDiscountTotal = bundleDiscountTotal.add(bundleDiscount);
            } else {
                individualDiscountTotal = individualDiscountTotal.add(safe(pricingSnapshot.getDiscountAmount()));
            }

            finalTotal =
                    finalTotal.add(
                            finalServiceAmount
                    );
        }


        /*
         * =========================================
         * 10. RETURN BOOKING GROUP
         * =========================================
         */

        // Convert exact holds only after all booking documents have been saved.
        convertBookingHolds(serviceItems, customer.getId(), bookingGroupId);

        log.info("Booking group created bookingGroupId={} customerId={} bookingCount={} originalTotal={} totalDiscount={} finalTotal={} bundleApplied={}",
                bookingGroupId,
                customer.getId(),
                bookingResponses.size(),
                originalTotal,
                totalDiscount,
                finalTotal,
                bundleApplied);

        return BookingGroupResponse
                .builder()

                .bookingGroupId(
                        bookingGroupId
                )

                .customerId(
                        customer.getId()
                )

                .eventType(
                        request.getEventType()
                )

                .specialRequest(
                        request.getSpecialRequest()
                )

                .originalTotal(
                        originalTotal
                )

                .totalDiscount(
                        totalDiscount
                )
                .individualDiscount(individualDiscountTotal)
                .bundleDiscount(bundleDiscountTotal)

                .finalTotal(
                        finalTotal
                )

                .bundleApplied(
                        bundleApplied
                )

                .qualifyingServiceCount(
                        qualifyingServiceCount
                )

                .bookings(
                        bookingResponses
                )

                .build();
    }

    @Override
    public List<BookingResponse> getVendorBookings() {

        vendorPermissionService.checkView(
                VendorPage.BOOKINGS
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        List<Booking> bookings =
                bookingRepository.findByVendorId(vendorId);

        log.info("Retrieved vendor bookings vendorId={} bookingCount={}",
                vendorId, bookings.size());

        return enrichBookingResponses(bookings);
    }

    /*
     * =========================================
     * ENRICH BOOKING RESPONSES
     * =========================================
     *
     * Booking stores serviceId.
     * UI-only service information such as:
     *
     * - serviceImage
     * - serviceCategory
     *
     * is enriched from VendorService.
     *
     * All related services are loaded in one query.
     */
    private List<BookingResponse> enrichBookingResponses(
            List<Booking> bookings
    ) {

        if (
                bookings == null ||
                        bookings.isEmpty()
        ) {

            return List.of();

        }

        List<String> serviceIds =
                bookings
                        .stream()
                        .map(
                                Booking::getServiceId
                        )
                        .filter(
                                serviceId ->
                                        serviceId != null &&
                                                !serviceId.isBlank()
                        )
                        .distinct()
                        .toList();

        Map<String, VendorService> serviceMap =
                vendorServiceRepository
                        .findAllById(
                                serviceIds
                        )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        VendorService::getId,
                                        service -> service
                                )
                        );

        return bookings
                .stream()
                .map(
                        booking ->
                                bookingMapper.toResponse(
                                        booking,
                                        serviceMap.get(
                                                booking.getServiceId()
                                        )
                                )
                )
                .toList();

    }

    @Override
    public List<BookingResponse> getCustomerBookings() {

        String customerId =
                authenticatedUserService
                        .getCurrentUser()
                        .getId();

        List<Booking> bookings =
                bookingRepository
                        .findByCustomerId(
                                customerId
                        );

        log.info("Retrieved customer bookings customerId={} bookingCount={}",
                customerId, bookings.size());

        return enrichBookingResponses(
                bookings
        );

    }

    @Override
    public List<BookingResponse> getServiceBookings(
            String serviceId
    ) {

        vendorPermissionService.checkView(
                VendorPage.BOOKINGS
        );

        String vendorId =
                vendorAccessService.getEffectiveVendorId();

        VendorService service =
                vendorServiceRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service not found"
                                )
                        );

        if (!vendorId.equals(
                service.getVendorId()
        )) {

            throw new AccessDeniedException(
                    "Access denied."
            );
        }

        List<Booking> bookings =
                bookingRepository.findByServiceId(
                        serviceId
                );

        log.info("Retrieved service bookings vendorId={} serviceId={} bookingCount={}",
                vendorId, serviceId, bookings.size());

        return enrichBookingResponses(
                bookings
        );
    }

    /*
     * =========================================
     * VALIDATE ACTIVE BOOKING HOLDS
     * =========================================
     *
     * A hold is valid only when:
     *
     * 1. It belongs to the current customer.
     * 2. It belongs to the requested service, slot and date.
     * 3. Its status is ACTIVE.
     * 4. Its expiry time is still in the future.
     *
     * Expired holds are intentionally not changed here.
     * The availability query already treats them as no
     * longer consuming capacity because it filters by
     * expiresAt > now. The purpose of this method is to
     * stop a stale cart item from reaching final booking.
     */
    private void validateActiveBookingHolds(
            List<BookingServiceItemRequest> serviceItems,
            String customerId
    ) {

        LocalDateTime now = LocalDateTime.now();

        for (BookingServiceItemRequest item : serviceItems) {
            if (item.getHoldId() != null && !item.getHoldId().isBlank()) {
                BookingHold hold = bookingHoldRepository.findById(item.getHoldId())
                        .orElseThrow(() -> new ExpiredBookingHoldException(
                                item.getServiceId(), item.getSlotId(),
                                item.getBookingFrom() == null ? null : item.getBookingFrom().toLocalDate().toString(),
                                item.getHoldId()));

                boolean validExactHold =
                        customerId.equals(hold.getCustomerId())
                                && item.getServiceId().equals(hold.getServiceId())
                                && hold.getStatus() == BookingHoldStatus.ACTIVE
                                && hold.getExpiresAt() != null
                                && hold.getExpiresAt().isAfter(now)
                                && Objects.equals(hold.getSlotId(), item.getSlotId())
                                && Objects.equals(hold.getPackageId(), item.getPackageId())
                                && Objects.equals(hold.getBookingType() == null ? "STANDARD_SLOT" : hold.getBookingType(),
                                item.getBookingType() == null ? "STANDARD_SLOT" : item.getBookingType())
                                && hold.getBookingFrom() != null
                                && hold.getBookingTo() != null
                                && Objects.equals(hold.getBookingFrom(), item.getBookingFrom())
                                && Objects.equals(hold.getBookingTo(), item.getBookingTo())
                                && (!"ROOM_STAY".equalsIgnoreCase(item.getBookingType())
                                || Objects.equals(
                                hold.getRoomQuantity() == null ? 1 : hold.getRoomQuantity(),
                                item.getRoomQuantity() == null ? 1 : item.getRoomQuantity()));

                if (!validExactHold) {
                    log.warn("Exact booking hold rejected customerId={} serviceId={} holdId={}",
                            customerId, item.getServiceId(), item.getHoldId());
                    throw new ExpiredBookingHoldException(
                            item.getServiceId(), item.getSlotId(),
                            item.getBookingFrom() == null ? null : item.getBookingFrom().toLocalDate().toString(),
                            item.getHoldId());
                }
                continue;
            }

            /*
             * Compatibility path for older direct-booking callers that do not
             * yet send holdId. New cart/checkout callers should always send it.
             * Keep the existing flow working while the direct-entry point is
             * migrated to pass the exact hold ID.
             */
            log.warn("Legacy booking request has no holdId; using compatibility validation serviceId={} customerId={}",
                    item.getServiceId(), customerId);

            List<BookingHold> activeHolds =
                    bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                            item.getServiceId(), BookingHoldStatus.ACTIVE, now);

            boolean validHold = activeHolds.stream().anyMatch(hold ->
                    customerId.equals(hold.getCustomerId())
                            && hold.getBookingFrom() != null
                            && hold.getBookingTo() != null
                            && Objects.equals(hold.getBookingFrom(), item.getBookingFrom())
                            && Objects.equals(hold.getBookingTo(), item.getBookingTo())
                            && Objects.equals(hold.getBookingType() == null ? "STANDARD_SLOT" : hold.getBookingType(),
                            item.getBookingType() == null ? "STANDARD_SLOT" : item.getBookingType())
                            && Objects.equals(hold.getSlotId(), item.getSlotId())
                            && Objects.equals(hold.getPackageId(), item.getPackageId()));

            if (!validHold) {
                log.warn("Booking rejected because active hold is missing or expired customerId={} serviceId={} slotId={} bookingFrom={}",
                        customerId, item.getServiceId(), item.getSlotId(), item.getBookingFrom());
                throw new ExpiredBookingHoldException(
                        item.getServiceId(), item.getSlotId(),
                        item.getBookingFrom() == null ? null : item.getBookingFrom().toLocalDate().toString(),
                        item.getHoldId());
            }
        }
    }

    /** Mark only the exact validated holds as converted after bookings are saved. */
    private void convertBookingHolds(
            List<BookingServiceItemRequest> serviceItems,
            String customerId,
            String bookingGroupId
    ) {
        LocalDateTime now = LocalDateTime.now();
        for (BookingServiceItemRequest item : serviceItems) {
            if (item.getHoldId() == null || item.getHoldId().isBlank()) {
                continue;
            }
            BookingHold hold = bookingHoldRepository.findById(item.getHoldId())
                    .orElseThrow(() -> new ExpiredBookingHoldException(
                            item.getServiceId(), item.getSlotId(),
                            item.getBookingFrom() == null ? null : item.getBookingFrom().toLocalDate().toString(),
                            item.getHoldId()));
            if (!customerId.equals(hold.getCustomerId())
                    || !item.getServiceId().equals(hold.getServiceId())
                    || hold.getStatus() != BookingHoldStatus.ACTIVE
                    || hold.getExpiresAt() == null
                    || !hold.getExpiresAt().isAfter(now)
                    || !Objects.equals(hold.getSlotId(), item.getSlotId())
                    || !Objects.equals(hold.getPackageId(), item.getPackageId())
                    || !Objects.equals(hold.getBookingFrom(), item.getBookingFrom())
                    || !Objects.equals(hold.getBookingTo(), item.getBookingTo())
                    || ("ROOM_STAY".equalsIgnoreCase(item.getBookingType())
                    && !Objects.equals(hold.getRoomQuantity() == null ? 1 : hold.getRoomQuantity(),
                    item.getRoomQuantity() == null ? 1 : item.getRoomQuantity()))
                    || !Objects.equals(hold.getBookingType() == null ? "STANDARD_SLOT" : hold.getBookingType(),
                    item.getBookingType() == null ? "STANDARD_SLOT" : item.getBookingType())) {
                throw new ExpiredBookingHoldException(
                        item.getServiceId(), item.getSlotId(),
                        item.getBookingFrom() == null ? null : item.getBookingFrom().toLocalDate().toString(),
                        item.getHoldId());
            }
            hold.setStatus(BookingHoldStatus.CONVERTED);
            hold.setBookingGroupId(bookingGroupId);
            bookingHoldRepository.save(hold);
        }
    }


    private void validatePackageSlot(
            VendorService service,
            ServicePackage selectedPackage,
            BookingServiceItemRequest item
    ) {
        boolean isStay = service.getCategory() == com.booking.model.enums.ServiceCategory.STAY;
        if (selectedPackage == null) {
            if (isStay) {
                throw new IllegalArgumentException("A package is required for STAY bookings.");
            }
            if (item.getSlotId() == null || item.getSlotId().isBlank()) {
                throw new IllegalArgumentException("A booking slot or an explicitly configured slot-free package is required.");
            }
            return;
        }

        boolean requiresSlot = isStay || !Boolean.FALSE.equals(selectedPackage.getRequiresSlot());
        String slotId = item.getSlotId();

        if (!requiresSlot && !isStay) {
            throw new IllegalArgumentException("Slot-free packages are supported only for STAY services.");
        }
        if (requiresSlot && (slotId == null || slotId.isBlank())) {
            throw new IllegalArgumentException("Select a booking slot for this package.");
        }

        List<String> allowedSlots = selectedPackage.getSlotIds();
        if (isStay && (allowedSlots == null || allowedSlots.isEmpty())) {
            throw new IllegalArgumentException("The selected STAY package must be assigned to at least one booking slot.");
        }
        if (requiresSlot && allowedSlots != null && !allowedSlots.isEmpty()
                && !allowedSlots.contains(slotId)) {
            throw new IllegalArgumentException("The selected booking slot is not available for this package.");
        }

        if (isStay) {
            if (selectedPackage.getMaxGuestsPerRoom() == null || selectedPackage.getMaxGuestsPerRoom() < 1) {
                throw new IllegalArgumentException("Configure the maximum guests per room for this STAY package.");
            }
            if (item.getRoomQuantity() == null || item.getRoomQuantity() < 1) {
                throw new IllegalArgumentException("At least one room must be selected for this STAY package.");
            }
        }
    }

    private ServicePackage resolvePackage(
            VendorService service,
            String packageId,
            LocalDate eventDate
    ) {

        if (packageId == null || packageId.isBlank()) {
            return null;
        }

        VendorServicePricing pricing =
                pricingRepository
                        .findByServiceIdOrderByVersionDesc(
                                service.getId()
                        )
                        .stream()
                        .filter(candidate ->
                                isPricingApplicable(
                                        candidate,
                                        eventDate
                                )
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No applicable pricing found for service: "
                                                + service.getId()
                                ));

        List<ServicePackage> packages =
                pricing.getPackages() == null
                        ? List.of()
                        : pricing.getPackages();

        ServicePackage selectedPackage =
                packages
                        .stream()
                        .filter(pkg ->
                                packageId.equals(pkg.getId())
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Selected package not found: "
                                                + packageId
                                ));

        if (!selectedPackage.isActive()) {
            throw new IllegalArgumentException(
                    "Selected package is not active."
            );
        }

        return selectedPackage;
    }

    private boolean isPricingApplicable(
            VendorServicePricing pricing,
            LocalDate eventDate
    ) {

        if (pricing.getEffectiveFrom() != null
                && eventDate.isBefore(
                pricing.getEffectiveFrom()
        )) {
            return false;
        }

        if (pricing.getEffectiveUntil() != null
                && eventDate.isAfter(
                pricing.getEffectiveUntil()
        )) {
            return false;
        }

        return true;
    }

    private BookingPricingSnapshot createPricingSnapshot(
            PricingCalculationResult result
    ) {

        BookingPricingSnapshot snapshot =
                new BookingPricingSnapshot();


        /*
         * Pricing version
         */

        snapshot.setPricingId(
                result.getPricingId()
        );

        snapshot.setPricingVersion(
                result.getPricingVersion()
        );


        /*
         * Base amount
         */

        snapshot.setBaseAmount(
                safe(
                        result.getBaseAmount()
                )
        );


        /*
         * Pricing heads
         */

        List<BookingPricingHeadSnapshot> pricingHeads =

                result.getPricingHeads() == null

                        ? List.of()

                        : result.getPricingHeads()
                        .stream()
                        .map(head -> {

                            BookingPricingHeadSnapshot
                                    snapshotHead =
                                    new BookingPricingHeadSnapshot();


                            snapshotHead.setCode(
                                    head.getCode()
                            );


                            snapshotHead.setName(
                                    head.getName()
                            );


                            snapshotHead.setCalculationType(
                                    head.getCalculationType()
                            );


                            snapshotHead.setValue(
                                    head.getValue()
                            );


                            snapshotHead.setCalculatedAmount(
                                    head.getCalculatedAmount()
                            );


                            snapshotHead.setDisplayOrder(
                                    head.getDisplayOrder()
                            );


                            return snapshotHead;

                        })
                        .toList();


        snapshot.setPricingHeads(
                pricingHeads
        );


        /*
         * Subtotal
         */

        snapshot.setSubtotal(
                safe(
                        result.getSubtotal()
                )
        );


        /*
         * Discounts
         */

        List<BookingDiscountSnapshot> discounts =

                result.getDiscounts() == null

                        ? List.of()

                        : result.getDiscounts()
                        .stream()
                        .map(discount -> {

                            BookingDiscountSnapshot
                                    snapshotDiscount =
                                    new BookingDiscountSnapshot();


                            snapshotDiscount.setName(
                                    discount.getName()
                            );


                            snapshotDiscount.setDiscountType(
                                    discount.getDiscountType()
                            );


                            snapshotDiscount.setValue(
                                    discount.getValue()
                            );


                            snapshotDiscount.setCalculatedAmount(
                                    discount.getCalculatedAmount()
                            );


                            return snapshotDiscount;

                        })
                        .toList();


        snapshot.setDiscounts(
                discounts
        );


        /*
         * Discount amount
         */

        snapshot.setDiscountAmount(
                safe(
                        result.getDiscountAmount()
                )
        );


        /*
         * Final total
         */

        snapshot.setTotalAmount(
                safe(
                        result.getTotalAmount()
                )
        );


        /*
         * Advance amount
         */

        snapshot.setAdvanceAmount(
                safe(
                        result.getAdvanceAmount()
                )
        );


        /*
         * Balance amount
         */

        snapshot.setBalanceAmount(
                safe(
                        result.getBalanceAmount()
                )
        );


        /*
         * Initially nothing has been paid.
         */

        snapshot.setPaidAmount(
                BigDecimal.ZERO
        );


        return snapshot;
    }

    private void scaleStayPricingSnapshot(BookingPricingSnapshot snapshot, int quantity) {
        if (snapshot == null || quantity <= 1) return;
        BigDecimal multiplier = BigDecimal.valueOf(quantity);
        snapshot.setBaseAmount(safe(snapshot.getBaseAmount()).multiply(multiplier));
        snapshot.setSubtotal(safe(snapshot.getSubtotal()).multiply(multiplier));
        snapshot.setDiscountAmount(safe(snapshot.getDiscountAmount()).multiply(multiplier));
        snapshot.setAdvanceAmount(safe(snapshot.getAdvanceAmount()).multiply(multiplier));
        snapshot.setBalanceAmount(safe(snapshot.getBalanceAmount()).multiply(multiplier));
        if (snapshot.getPricingHeads() != null) {
            snapshot.getPricingHeads().forEach(head -> head.setCalculatedAmount(
                    safe(head.getCalculatedAmount()).multiply(multiplier)));
        }
        if (snapshot.getDiscounts() != null) {
            snapshot.getDiscounts().forEach(discount -> discount.setCalculatedAmount(
                    safe(discount.getCalculatedAmount()).multiply(multiplier)));
        }
    }

    private BigDecimal safe(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    @Override
    public BookingCancellationResponse cancelBooking(
            String bookingId
    ) {

        log.info("Cancelling booking bookingId={}", bookingId);

        User currentUser = SecurityUtil.getCurrentUser();

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found."
                                ));

        validateCancellation(booking, currentUser);

        /*
         * Calculate cancellation charges
         */

        CancellationCalculation calculation =
                calculateCancellation(
                        booking
                );

        /*
         * Update booking
         */

        booking.setStatus(
                BookingStatus.CANCELLED
        );

        BigDecimal paidAmount = safe(booking.getPaidAmount());
        BigDecimal refundableAmount = safe(calculation.getRefundableAmount());
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0
                && refundableAmount.compareTo(BigDecimal.ZERO) > 0) {
            booking.setPaymentStatus(PaymentStatus.REFUND_PENDING);
        }
        // A cancelled booking must never retain a collectible balance.
        if (booking.getPricingSnapshot() != null) {
            booking.getPricingSnapshot().setBalanceAmount(BigDecimal.ZERO);
        }

        booking.setCancelledAt(
                LocalDateTime.now()
        );

        booking.setRefundPercentage(
                calculation.getRefundPercentage()
        );

        booking.setCancellationCharge(
                calculation.getCancellationCharge()
        );

        booking.setRefundableAmount(
                calculation.getRefundableAmount()
        );

        bookingRepository.save(
                booking
        );

        log.info("Booking cancelled bookingId={} bookingNumber={} refundPercentage={} paymentStatus={}",
                booking.getId(),
                booking.getBookingNumber(),
                calculation.getRefundPercentage(),
                booking.getPaymentStatus());

        return BookingCancellationResponse
                .builder()

                .bookingId(
                        booking.getId()
                )

                .bookingNumber(
                        booking.getBookingNumber()
                )

                .bookingStatus(
                        booking.getStatus().name()
                )

                .paymentStatus(
                        booking.getPaymentStatus().name()
                )

                .cancellationCharge(
                        calculation.getCancellationCharge()
                )

                .refundableAmount(
                        calculation.getRefundableAmount()
                )

                .message(
                        "Booking cancelled successfully."
                )

                .build();

    }

    @Override
    public CustomerBookingDetailsResponse getBookingDetails(
            String bookingId
    ) {

        log.info("Retrieving booking details bookingId={}", bookingId);

        /*
         * =========================================
         * GET AUTHENTICATED USER
         * =========================================
         */

        User currentUser =
                SecurityUtil.getCurrentUser();


        /*
         * =========================================
         * GET BOOKING
         * =========================================
         */

        Booking booking =
                bookingRepository
                        .findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found."
                                )
                        );


        /*
         * =========================================
         * ACCESS CONTROL
         * =========================================
         *
         * CUSTOMER
         * --------
         * Customer can view only their own booking.
         *
         * VENDOR_ADMIN
         * ------------
         * VendorAdmin can view bookings belonging
         * to their vendor account.
         *
         * VENDOR_USER
         * -----------
         * VendorUser can view bookings belonging
         * to their vendor account.
         *
         * ADMIN
         * -----
         * Admin can view a vendor booking only
         * when Support Mode is active.
         */

        switch (currentUser.getRole()) {

            /*
             * =====================================
             * CUSTOMER
             * =====================================
             */

            case CUSTOMER -> {

                if (!booking
                        .getCustomerId()
                        .equals(currentUser.getId())) {

                    throw new AccessDeniedException(
                            "You cannot view this booking."
                    );
                }
            }


            /*
             * =====================================
             * VENDOR ADMIN
             * =====================================
             */

            case VENDOR_ADMIN -> {

                vendorPermissionService.checkView(
                        VendorPage.BOOKINGS
                );

                String vendorId =
                        vendorAccessService
                                .getEffectiveVendorId();

                if (!booking
                        .getVendorId()
                        .equals(vendorId)) {

                    throw new AccessDeniedException(
                            "You cannot view this booking."
                    );
                }
            }


            /*
             * =====================================
             * VENDOR USER
             * =====================================
             */

            case VENDOR_USER -> {

                vendorPermissionService.checkView(
                        VendorPage.BOOKINGS
                );

                String vendorId =
                        vendorAccessService
                                .getEffectiveVendorId();

                if (!booking
                        .getVendorId()
                        .equals(vendorId)) {

                    throw new AccessDeniedException(
                            "You cannot view this booking."
                    );
                }
            }


            /*
             * =====================================
             * ADMIN
             * =====================================
             *
             * VendorAccessService will require an
             * active Vendor Support Session.
             */

            case ADMIN -> {

                String vendorId =
                        vendorAccessService
                                .getEffectiveVendorId();

                if (!booking
                        .getVendorId()
                        .equals(vendorId)) {

                    throw new AccessDeniedException(
                            "You cannot view this booking."
                    );
                }
            }


            /*
             * =====================================
             * EVERYTHING ELSE
             * =====================================
             */

            default -> throw new AccessDeniedException(
                    "You are not authorized to view this booking."
            );
        }


        /*
         * =========================================
         * GET VENDOR
         * =========================================
         */

        User vendor =
                userRepository
                        .findById(
                                booking.getVendorId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vendor not found."
                                )
                        );


        /*
         * =========================================
         * PRICING SNAPSHOT
         * =========================================
         */

        BookingPricingSnapshot snapshot =
                booking.getPricingSnapshot();

        VendorService bookingService = vendorServiceRepository.findById(booking.getServiceId()).orElse(null);
        String serviceCategory = bookingService == null || bookingService.getCategory() == null
                ? null : bookingService.getCategory().name();
        String slotName = booking.getSlotName();
        String slotStartTime = booking.getSlotStartTime();
        String slotEndTime = booking.getSlotEndTime();
        if (booking.getSlotId() != null && (slotName == null || slotName.isBlank())) {
            var legacySlot = bookingSlotRepository.findById(booking.getSlotId()).orElse(null);
            if (legacySlot != null) {
                slotName = legacySlot.getSlotName();
                slotStartTime = legacySlot.getStartTime() == null ? null : legacySlot.getStartTime().toString();
                slotEndTime = legacySlot.getEndTime() == null ? null : legacySlot.getEndTime().toString();
            }
        }
        List<String> allocatedResourceIds = new ArrayList<>();
        List<String> allocatedResourceNames = new ArrayList<>();
        if (booking.getResourceAllocations() != null) {
            booking.getResourceAllocations().forEach(allocation -> {
                if (allocation.getResourceIds() != null) allocatedResourceIds.addAll(allocation.getResourceIds());
            });
        }
        if (allocatedResourceIds.isEmpty() && booking.getResourceIds() != null) {
            allocatedResourceIds.addAll(booking.getResourceIds());
        }
        String resourceTypeName = null;
        if ("STAY".equals(serviceCategory) && bookingService != null && bookingService.getResourceTypes() != null) {
            List<String> names = new ArrayList<>();
            if (booking.getResourceAllocations() != null) {
                booking.getResourceAllocations().forEach(allocation -> bookingService.getResourceTypes().stream()
                        .filter(type -> Objects.equals(type.getId(), allocation.getResourceTypeId()))
                        .findFirst().ifPresent(type -> names.add(type.getName())));
            }
            if (names.isEmpty() && booking.getResourceTypeId() != null) {
                bookingService.getResourceTypes().stream()
                        .filter(type -> Objects.equals(type.getId(), booking.getResourceTypeId()))
                        .findFirst().ifPresent(type -> names.add(type.getName()));
            }
            if (!names.isEmpty()) resourceTypeName = String.join(", ", names);
            if (bookingService.getResourceTypes() != null) {
                for (var resourceType : bookingService.getResourceTypes()) {
                    if (booking.getResourceAllocations() != null && !booking.getResourceAllocations().isEmpty()) {
                        booking.getResourceAllocations().stream()
                                .filter(allocation -> Objects.equals(allocation.getResourceTypeId(), resourceType.getId()))
                                .filter(allocation -> allocation.getResourceIds() != null)
                                .forEach(allocation -> allocation.getResourceIds().forEach(resourceId -> {
                                    var unit = resourceType.getUnits() == null ? null : resourceType.getUnits().stream()
                                            .filter(candidate -> Objects.equals(candidate.getId(), resourceId))
                                            .findFirst().orElse(null);
                                    allocatedResourceNames.add(unit == null || unit.getName() == null || unit.getName().isBlank()
                                            ? resourceId : unit.getName());
                                }));
                    } else if (Objects.equals(resourceType.getId(), booking.getResourceTypeId()) && resourceType.getUnits() != null) {
                        allocatedResourceIds.forEach(resourceId -> resourceType.getUnits().stream()
                                .filter(unit -> Objects.equals(unit.getId(), resourceId)).findFirst()
                                .ifPresent(unit -> allocatedResourceNames.add(unit.getName() == null ? resourceId : unit.getName())));
                    }
                }
            }
        }
        if (allocatedResourceNames.isEmpty()) allocatedResourceNames.addAll(allocatedResourceIds);
        User customer = booking.getCustomerId() == null ? null : userRepository.findById(booking.getCustomerId()).orElse(null);
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : customer == null ? null : customer.getFullName();
        String customerPhone = booking.getCustomerPhone() != null ? booking.getCustomerPhone() : customer == null ? null : customer.getPhone();
        String customerEmail = booking.getCustomerEmail() != null ? booking.getCustomerEmail() : customer == null ? null : customer.getEmail();

        /*
         * =========================================
         * RESPONSE
         * =========================================
         */

        return CustomerBookingDetailsResponse
                .builder()

                .bookingId(
                        booking.getId()
                )

                .bookingNumber(
                        booking.getBookingNumber()
                )

                .serviceId(
                        booking.getServiceId()
                )

                .serviceName(
                        booking.getServiceName()
                )

                .vendorId(
                        vendor.getId()
                )

                .vendorName(
                        vendor.getFullName()
                )

                .vendorPhone(
                        vendor.getPhone()
                )

                .vendorEmail(
                        vendor.getEmail()
                )
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .vendorCanCancel((currentUser.getRole() == com.booking.model.enums.Role.VENDOR_ADMIN
                        || currentUser.getRole() == com.booking.model.enums.Role.VENDOR_USER)
                        && Objects.equals(booking.getVendorId(), vendorAccessService.getEffectiveVendorId())
                        && isVendorCreatedBooking(booking))

                .bookingDate(
                        booking.getCreatedTs()
                                .toLocalDate()
                )

                .bookingFrom(booking.getBookingFrom())
                .bookingTo(booking.getBookingTo())
                .serviceCategory(serviceCategory)
                .bookingType(booking.getBookingType())
                .roomQuantity(booking.getRoomQuantity())
                .slotId(booking.getSlotId())
                .slotName(slotName)
                .slotStartTime(slotStartTime)
                .slotEndTime(slotEndTime)
                .resourceIds(allocatedResourceIds)
                .resourceNames(allocatedResourceNames)
                .resourceTypeName(resourceTypeName)

                .guestCount(
                        booking.getGuestCount()
                )

                .eventType(
                        booking.getEventType()
                )

                .specialRequest(
                        booking.getSpecialRequest()
                )

                .bookingStatus(
                        booking.getStatus()
                )

                .paymentStatus(
                        booking.getPaymentStatus()
                )

                .baseAmount(
                        snapshot.getBaseAmount()
                )

                .subtotal(
                        snapshot.getSubtotal()
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

                .paidAmount(
                        booking.getPaidAmount()
                )

                .pricingHeads(
                        snapshot.getPricingHeads()
                )

                .discounts(
                        snapshot.getDiscounts()
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

                .build();
    }

    @Override
    public CancellationPreviewResponse getCancellationPreview(
            String bookingId
    ) {

        log.info("Calculating cancellation preview bookingId={}", bookingId);

        User currentUser = SecurityUtil.getCurrentUser();

        Booking booking =
                bookingRepository
                        .findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found."
                                ));

        validateCancellation(
                booking,
                currentUser
        );

        CancellationCalculation calculation =
                calculateCancellation(
                        booking
                );

        return CancellationPreviewResponse
                .builder()

                .bookingId(
                        booking.getId()
                )

                .bookingNumber(
                        booking.getBookingNumber()
                )

                .bookingFrom(booking.getBookingFrom())
                .bookingTo(booking.getBookingTo())

                .totalAmount(
                        booking.getTotalAmount()
                )

                .paidAmount(
                        booking.getPaidAmount()
                )

                .daysBeforeEvent(
                        calculation.getDaysBeforeEvent()
                )

                .refundPercentage(
                        calculation.getRefundPercentage()
                )

                .refundableAmount(
                        calculation.getRefundableAmount()
                )

                .cancellationCharge(
                        calculation.getCancellationCharge()
                )

                .processingDays(
                        calculation.getProcessingDays()
                )

                .cancellationAllowed(
                        true
                )

                .build();

    }

    private CancellationCalculation calculateCancellation(
            Booking booking
    ) {
        BigDecimal amountPaid = safe(booking.getPaidAmount());
        long daysBeforeEvent = booking.getBookingFrom() == null
                ? 0L
                : ChronoUnit.DAYS.between(LocalDate.now(), booking.getBookingFrom().toLocalDate());

        // An unpaid booking is cancelled without creating a charge or balance.
        // No policy lookup is needed when there is no paid amount to refund.
        if (amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            return CancellationCalculation.builder()
                    .daysBeforeEvent((int) daysBeforeEvent)
                    .refundPercentage(0)
                    .refundableAmount(BigDecimal.ZERO)
                    .cancellationCharge(BigDecimal.ZERO)
                    .processingDays(0)
                    .build();
        }

        ServiceSettings settings =
                serviceSettingsRepository
                        .findByServiceId(
                                booking.getServiceId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Service settings not found."
                                ));

        CancellationPolicy policy =
                settings.getCancellationPolicy();


        RefundRule matchedRule = policy == null || policy.getRefundRules() == null
                ? null
                : policy.getRefundRules().stream()
                .filter(rule -> {
                    boolean minimum = daysBeforeEvent >= rule.getMinDaysBeforeEvent();
                    boolean maximum = rule.getMaxDaysBeforeEvent() == null
                            || daysBeforeEvent <= rule.getMaxDaysBeforeEvent();
                    return minimum && maximum;
                })
                .findFirst()
                .orElse(null);

        int refundPercentage = matchedRule == null ? 0 : matchedRule.getRefundPercentage();
        BigDecimal calculationBasis = policy != null
                && policy.getRefundOn() == com.booking.model.enums.RefundOnType.TOTAL_AMOUNT
                ? safe(booking.getTotalAmount())
                : amountPaid;
        BigDecimal policyRefund = calculationBasis
                .multiply(BigDecimal.valueOf(refundPercentage))
                .divide(BigDecimal.valueOf(100));
        BigDecimal policyCharge = calculationBasis.subtract(policyRefund).max(BigDecimal.ZERO);

        // The vendor can retain only money already received. Never create a debt
        // or an outstanding cancellation balance for the customer.
        BigDecimal cancellationCharge = policyCharge.min(amountPaid);
        BigDecimal refundableAmount = amountPaid.subtract(cancellationCharge).max(BigDecimal.ZERO);

        return CancellationCalculation

                .builder()

                .daysBeforeEvent(
                        (int) daysBeforeEvent
                )

                .refundPercentage(
                        refundPercentage
                )

                .refundableAmount(
                        refundableAmount
                )

                .cancellationCharge(
                        cancellationCharge
                )

                .processingDays(
                        policy == null || policy.getProcessingDays() == null ? 0 : policy.getProcessingDays()
                )

                .build();

    }

    private void validateCancellation(
            Booking booking,
            User currentUser
    ) {
        if (currentUser == null) {
            throw new AccessDeniedException("You are not authorized to cancel this booking.");
        }

        boolean customerOwnsBooking = currentUser.getRole() == com.booking.model.enums.Role.CUSTOMER
                && Objects.equals(booking.getCustomerId(), currentUser.getId());

        if (customerOwnsBooking) {
            ServiceSettings serviceSettings = serviceSettingsRepository
                    .findByServiceId(booking.getServiceId()).orElse(null);
            CancellationPolicy customerPolicy = serviceSettings == null
                    ? null : serviceSettings.getCancellationPolicy();
            if (customerPolicy != null && Boolean.FALSE.equals(customerPolicy.getAllowCancellation())) {
                throw new IllegalStateException("Customer cancellation is not allowed for this service.");
            }
        }

        boolean vendorOwnsBooking = false;
        if (currentUser.getRole() == com.booking.model.enums.Role.VENDOR_ADMIN
                || currentUser.getRole() == com.booking.model.enums.Role.VENDOR_USER) {
            vendorPermissionService.checkEdit(VendorPage.BOOKINGS);
            String effectiveVendorId = vendorAccessService.getEffectiveVendorId();
            if (!Objects.equals(booking.getVendorId(), effectiveVendorId)) {
                throw new AccessDeniedException("You cannot cancel a booking belonging to another vendor.");
            }

            // Audit metadata is the primary source for who initiated the booking.
            // For bookings created through the vendor-side booking flow, the
            // authenticated vendor is also stored as customerId by the existing
            // createBooking flow. Use that persisted identity as a fallback for
            // older records where created_user was not populated.
            vendorOwnsBooking = isVendorCreatedBooking(booking);
            if (!vendorOwnsBooking) {
                throw new AccessDeniedException(
                        "This booking was created by the customer. Please contact the customer and ask them to cancel it."
                );
            }
        }

        if (!customerOwnsBooking && !vendorOwnsBooking) {
            throw new AccessDeniedException("You cannot cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Completed booking cannot be cancelled.");
        }

        if (booking.getBookingFrom() == null
                || booking.getBookingFrom().toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Past bookings cannot be cancelled.");
        }
    }

    private boolean isVendorCreatedBooking(Booking booking) {
        if (booking == null || booking.getVendorId() == null) {
            return false;
        }

        // Check the audit creator first. This remains authoritative when present.
        User auditCreator = booking.getCreatedUser() == null
                ? null : userRepository.findById(booking.getCreatedUser()).orElse(null);
        if (belongsToBookingVendor(auditCreator, booking.getVendorId())) {
            return true;
        }

        // Legacy/vendor-originated bookings can have no created_user audit value.
        // The createBooking flow stores its authenticated principal in customerId;
        // verify that principal's vendor role and vendor relationship before
        // allowing cancellation. A normal customer account will never pass this.
        User bookingInitiator = booking.getCustomerId() == null
                ? null : userRepository.findById(booking.getCustomerId()).orElse(null);
        return belongsToBookingVendor(bookingInitiator, booking.getVendorId());
    }

    private boolean belongsToBookingVendor(User user, String bookingVendorId) {
        if (user == null || bookingVendorId == null) return false;
        if (user.getRole() == com.booking.model.enums.Role.VENDOR_ADMIN) {
            return Objects.equals(user.getId(), bookingVendorId);
        }
        return user.getRole() == com.booking.model.enums.Role.VENDOR_USER
                && Objects.equals(user.getVendorId(), bookingVendorId);
    }

    private void validateBookingGroupAccess(
            List<Booking> bookings
    ) {

        User currentUser =
                SecurityUtil.getCurrentUser();

        switch (currentUser.getRole()) {

            case CUSTOMER -> {

                boolean ownsAll =
                        bookings.stream()
                                .allMatch(
                                        booking ->
                                                currentUser.getId()
                                                        .equals(
                                                                booking.getCustomerId()
                                                        )
                                );

                if (!ownsAll) {
                    throw new AccessDeniedException(
                            "You cannot view this booking group."
                    );
                }
            }

            case VENDOR_ADMIN, VENDOR_USER -> {

                vendorPermissionService.checkView(
                        VendorPage.BOOKINGS
                );

                String vendorId =
                        vendorAccessService
                                .getEffectiveVendorId();

                boolean ownsAll =
                        bookings.stream()
                                .allMatch(
                                        booking ->
                                                vendorId.equals(
                                                        booking.getVendorId()
                                                )
                                );

                if (!ownsAll) {
                    throw new AccessDeniedException(
                            "You cannot view this booking group."
                    );
                }
            }

            case ADMIN -> {

                String vendorId =
                        vendorAccessService
                                .getEffectiveVendorId();

                boolean ownsAll =
                        bookings.stream()
                                .allMatch(
                                        booking ->
                                                vendorId.equals(
                                                        booking.getVendorId()
                                                )
                                );

                if (!ownsAll) {
                    throw new AccessDeniedException(
                            "You cannot view this booking group."
                    );
                }
            }

            default -> throw new AccessDeniedException(
                    "You are not authorized to view this booking group."
            );
        }
    }

    private List<BookingSelectedCateringDish>
    toBookingSelectedCateringDishes(
            BookingServiceItemRequest item
    ) {

        if (
                item.getSelectedCateringDishes() == null ||
                        item.getSelectedCateringDishes().isEmpty()
        ) {
            return new ArrayList<>();
        }

        return item.getSelectedCateringDishes()
                .stream()
                .map(selected -> {

                    BookingSelectedCateringDish dish =
                            new BookingSelectedCateringDish();

                    dish.setDishId(
                            selected.getDishId()
                    );

                    dish.setName(
                            selected.getName()
                    );

                    dish.setCategory(
                            selected.getCategory()
                    );

                    dish.setFoodType(
                            selected.getFoodType()
                    );

                    return dish;

                })
                .toList();
    }


    /** Stable identity for one independently-held booking line. */
    private static String bookingServiceItemKey(BookingServiceItemRequest item) {
        if (item.getHoldId() != null && !item.getHoldId().isBlank()) {
            return item.getHoldId();
        }
        return String.join("|",
                Objects.toString(item.getServiceId(), ""),
                Objects.toString(item.getSlotId(), ""),
                Objects.toString(item.getPackageId(), ""),
                Objects.toString(item.getBookingFrom(), ""),
                Objects.toString(item.getBookingTo(), ""),
                Objects.toString(item.getRoomQuantity(), "1"));
    }

    @Override
    public BookingGroupResponse getBookingGroup(
            String bookingGroupId
    ) {

        log.info("Retrieving booking group bookingGroupId={}", bookingGroupId);

        List<Booking> bookings =
                bookingRepository.findByBookingGroupId(
                        bookingGroupId
                );

        if (
                bookings == null ||
                        bookings.isEmpty()
        ) {

            log.warn("Booking group not found bookingGroupId={}",
                    bookingGroupId);

            throw new BookingNotFoundException(
                    "Booking group not found"
            );

        }

        validateBookingGroupAccess(bookings);

        /*
         * Enrich service information for the group so
         * serviceImage and serviceCategory are available
         * on the details screen as well.
         */
        List<BookingResponse> bookingResponses =
                enrichBookingResponses(
                        bookings
                );

        BigDecimal finalTotal =
                bookings.stream()
                        .map(booking -> safe(booking.getTotalAmount()))
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal originalTotal =
                bookings.stream()
                        .map(booking -> {

                            BookingPricingSnapshot snapshot =
                                    booking.getPricingSnapshot();

                            if (snapshot == null) {
                                return BigDecimal.ZERO;
                            }

                            return safe(
                                    snapshot.getSubtotal()
                            );

                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal totalDiscount =
                bookings.stream()
                        .map(booking -> {

                            BookingPricingSnapshot snapshot =
                                    booking.getPricingSnapshot();

                            if (snapshot == null) {
                                return BigDecimal.ZERO;
                            }

                            return safe(
                                    snapshot.getDiscountAmount()
                            );

                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal bundleDiscountTotal = bookings.stream()
                .map(booking -> booking.getPricingSnapshot())
                .filter(Objects::nonNull)
                .flatMap(snapshot -> snapshot.getDiscounts() == null ? java.util.stream.Stream.empty() : snapshot.getDiscounts().stream())
                .filter(discount -> "Bundle Discount".equalsIgnoreCase(discount.getName()))
                .map(discount -> safe(discount.getCalculatedAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal individualDiscountTotal = totalDiscount.subtract(bundleDiscountTotal).max(BigDecimal.ZERO);

        Booking firstBooking =
                bookings.get(0);


        boolean bundleApplied =
                bookings.stream()
                        .anyMatch(
                                booking ->
                                        booking.getBundleId() != null &&
                                                !booking.getBundleId().isBlank()
                        );


        int qualifyingServiceCount =
                (int) bookings.stream()
                        .filter(
                                booking ->
                                        booking.getBundleId() != null &&
                                                !booking.getBundleId().isBlank()
                        )
                        .count();

        log.info("Booking group retrieved bookingGroupId={} bookingCount={} finalTotal={} bundleApplied={}",
                bookingGroupId,
                bookings.size(),
                finalTotal,
                bundleApplied);

        return BookingGroupResponse
                .builder()

                .bookingGroupId(
                        bookingGroupId
                )

                .customerId(
                        firstBooking.getCustomerId()
                )

                .eventType(
                        firstBooking.getEventType()
                )

                .specialRequest(
                        firstBooking.getSpecialRequest()
                )

                .originalTotal(
                        originalTotal
                )

                .totalDiscount(
                        totalDiscount
                )
                .individualDiscount(individualDiscountTotal)
                .bundleDiscount(bundleDiscountTotal)

                .finalTotal(
                        finalTotal
                )

                .bundleApplied(
                        bundleApplied
                )

                .qualifyingServiceCount(
                        qualifyingServiceCount
                )

                .bookings(
                        bookingResponses
                )

                .build();
    }


}