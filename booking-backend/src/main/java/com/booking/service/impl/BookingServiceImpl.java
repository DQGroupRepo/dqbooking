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

                    String key =
                            item.getServiceId()
                                    + "_"
                                    + item.getEventDate();


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

        List<BookingServiceItemRequest> serviceItems =
                allServiceItems
                        .stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        item ->
                                                item.getServiceId()
                                                        + "_"
                                                        + item.getEventDate(),

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

                                calculationItem.setEventDate(
                                        item.getEventDate()
                                );

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
                            bundleRequest
                                    .getItems()
                                    .stream()
                                    .filter(
                                            item ->
                                                    item.getServiceId()
                                                            .equals(
                                                                    bundleItem.getServiceId()
                                                            )
                                    )
                                    .findFirst()
                                    .orElse(null);


                    if (matchingItem != null) {

                        String discountKey =
                                matchingItem.getServiceId()
                                        + "_"
                                        + matchingItem.getEventDate()
                                        + "_"
                                        + (
                                        matchingItem.getPackageId() != null
                                                ? matchingItem.getPackageId()
                                                : ""
                                );


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
                            item.getEventDate(),
                            item.getPackageId()
                    );

            ServicePackage selectedPackage =
                    resolvePackage(
                            vendorService,
                            item.getPackageId(),
                            item.getEventDate()
                    );


            BigDecimal serviceTotal =
                    safe(
                            pricingResult.getTotalAmount()
                    );


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

            String serviceItemKey =
                    item.getServiceId()
                            + "_"
                            + item.getEventDate();


            String bundleId =
                    serviceItemBundleMap.get(
                            serviceItemKey
                    );


            /*
             * =========================================
             * BUNDLE DISCOUNT
             * =========================================
             */

            String discountKey =
                    item.getServiceId()
                            + "_"
                            + item.getEventDate()
                            + "_"
                            + (
                            item.getPackageId() != null
                                    ? item.getPackageId()
                                    : ""
                    );


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


            booking.setEventDate(
                    item.getEventDate()
            );


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


            BookingPricingSnapshot pricingSnapshot =
                    createPricingSnapshot(
                            pricingResult
                    );


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

            BigDecimal existingDiscount =
                    safe(
                            pricingSnapshot
                                    .getDiscountAmount()
                    );



            pricingSnapshot.setDiscountAmount(
                    existingDiscount
                            .add(
                                    bundleDiscount
                            )
            );


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
                    booking.getEventDate(),
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

        LocalDateTime now =
                LocalDateTime.now();

        for (BookingServiceItemRequest item : serviceItems) {

            List<BookingHold> activeHolds =
                    bookingHoldRepository
                            .findByServiceIdAndSlotIdAndEventDateAndStatusAndExpiresAtAfter(
                                    item.getServiceId(),
                                    item.getSlotId(),
                                    item.getEventDate(),
                                    BookingHoldStatus.ACTIVE,
                                    now
                            );

            boolean validHold =
                    activeHolds
                            .stream()
                            .anyMatch(hold ->
                                    customerId.equals(
                                            hold.getCustomerId()
                                    )
                            );

            if (!validHold) {

                log.warn(
                        "Booking rejected because active hold is missing or expired " +
                                "customerId={} serviceId={} slotId={} eventDate={}",
                        customerId,
                        item.getServiceId(),
                        item.getSlotId(),
                        item.getEventDate()
                );

                throw new ExpiredBookingHoldException(
                        item.getServiceId(),
                        item.getSlotId(),
                        item.getEventDate().toString()
                );
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

        String email =
                SecurityUtil.getCurrentUserEmail();

        User customer =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authenticated user not found."
                                ));

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found."
                                ));

        validateCancellation(booking, customer);

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

        if (booking.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {

            booking.setPaymentStatus(
                    PaymentStatus.REFUND_PENDING
            );
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

                .bookingDate(
                        booking.getCreatedTs()
                                .toLocalDate()
                )

                .eventDate(
                        booking.getEventDate()
                )

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

        String email =
                SecurityUtil.getCurrentUserEmail();
        User customer =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authenticated user not found."
                                ));

        Booking booking =
                bookingRepository
                        .findById(bookingId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found."
                                ));

        validateCancellation(
                booking,
                customer
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

                .eventDate(
                        booking.getEventDate()
                )

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

        long daysBeforeEvent =

                ChronoUnit.DAYS.between(

                        LocalDate.now(),

                        booking.getEventDate()

                );

        RefundRule matchedRule =

                policy.getRefundRules()

                        .stream()

                        .filter(rule -> {

                            boolean minimum =

                                    daysBeforeEvent >=
                                            rule.getMinDaysBeforeEvent();

                            boolean maximum =

                                    rule.getMaxDaysBeforeEvent() == null ||

                                            daysBeforeEvent <=
                                                    rule.getMaxDaysBeforeEvent();

                            return minimum && maximum;

                        })

                        .findFirst()

                        .orElse(null);

        int refundPercentage =

                matchedRule == null

                        ? 0

                        : matchedRule.getRefundPercentage();

        BigDecimal refundableAmount =

                booking.getPaidAmount()

                        .multiply(

                                BigDecimal.valueOf(refundPercentage)

                        )

                        .divide(

                                BigDecimal.valueOf(100)

                        );

        BigDecimal cancellationCharge =

                booking.getPaidAmount()

                        .subtract(refundableAmount);

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
                        policy.getProcessingDays()
                )

                .build();

    }

    private void validateCancellation(
            Booking booking,
            User customer
    ) {

        if (!booking.getCustomerId().equals(customer.getId())) {

            throw new AccessDeniedException(
                    "You cannot cancel this booking."
            );

        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Booking is already cancelled."
            );

        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Completed booking cannot be cancelled."
            );

        }

        if (booking.getEventDate().isBefore(LocalDate.now())) {

            throw new IllegalStateException(
                    "Past bookings cannot be cancelled."
            );

        }

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