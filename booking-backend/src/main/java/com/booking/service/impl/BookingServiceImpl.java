package com.booking.service.impl;

import com.booking.dto.booking.*;
import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;
import com.booking.dto.bundle.BundleDiscountItem;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.exception.BookingNotFoundException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.helper.BookingHelper;
import com.booking.mapper.BookingMapper;
import com.booking.model.*;
import com.booking.model.embedded.*;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.NotificationType;
import com.booking.model.enums.PaymentStatus;
import com.booking.repository.*;
import com.booking.service.*;
import com.booking.util.BookingNumberGenerator;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService
       {

    private final BookingRepository bookingRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final UserRepository vendorRepository;

    private final AuthenticatedUserService authenticatedUserService;

    private final BookingNumberGenerator bookingNumberGenerator;

    private final BookingMapper bookingMapper;

    private final BookingHelper bookingHelper;

    private final NotificationService notificationService;

    private final PricingCalculationService pricingCalculationService;

   private final UserRepository userRepository;

   private final ServiceSettingsRepository serviceSettingsRepository;

   private final VendorServicePricingRepository pricingRepository;

   private final BundleCalculationService bundleCalculationService;

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
                       .getCurrentCustomer();


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
        * 3. DISTINCT SERVICE ITEMS
        * =========================================
        */

       List<BookingServiceItemRequest> serviceItems =
               request.getServices()
                       .stream()
                       .collect(
                               java.util.stream.Collectors.toMap(
                                       BookingServiceItemRequest::getServiceId,
                                       item -> item,
                                       (first, second) -> first
                               )
                       )
                       .values()
                       .stream()
                       .toList();


       if (serviceItems.isEmpty()) {

           throw new IllegalArgumentException(
                   "At least one service is required."
           );
       }


       /*
        * =========================================
        * 4. FIND SERVICES
        * =========================================
        */

       List<VendorService> services =
               serviceItems
                       .stream()
                       .map(item ->
                               vendorServiceRepository
                                       .findByIdAndActiveTrueAndDeletedFalse(
                                               item.getServiceId()
                                       )
                                       .orElseThrow(() ->
                                               new ResourceNotFoundException(
                                                       "Service not found: "
                                                               + item.getServiceId()
                                               )
                                       )
                       )
                       .toList();


       /*
        * =========================================
        * 5. PREPARE RESPONSE DATA
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
        * 6. PROCESS EACH SERVICE
        * =========================================
        */

       for (VendorService vendorService : services) {

           /*
            * Find request information for this service.
            */

           BookingServiceItemRequest item =
                   serviceItems
                           .stream()
                           .filter(serviceItem ->
                                   serviceItem
                                           .getServiceId()
                                           .equals(
                                                   vendorService.getId()
                                           )
                           )
                           .findFirst()
                           .orElseThrow(() ->
                                   new IllegalArgumentException(
                                           "Booking information missing for service."
                                   )
                           );


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
            */

           PricingCalculationResult pricingResult =
                   pricingCalculationService.calculatePrice(
                           vendorService.getId(),
                           item.getEventDate()
                   );


           BigDecimal serviceTotal =
                   safe(
                           pricingResult.getTotalAmount()
                   );


           /*
            * =========================================
            * BUNDLE DISCOUNT
            * =========================================
            *
            * Only services belonging to the same vendor
            * are considered together for bundle pricing.
            */

           List<String> vendorServiceIds =
                   services
                           .stream()
                           .filter(service ->
                                   service.getVendorId()
                                           .equals(
                                                   vendorService.getVendorId()
                                           )
                           )
                           .map(VendorService::getId)
                           .toList();


           BigDecimal bundleDiscount =
                   BigDecimal.ZERO;


           if (vendorServiceIds.size() > 1) {

               BundleCalculationRequest bundleRequest =
                       new BundleCalculationRequest();

               bundleRequest.setServiceIds(
                       vendorServiceIds
               );


               BundleCalculationResponse bundleResult =
                       bundleCalculationService
                               .calculateBundle(
                                       bundleRequest
                               );


               BundleDiscountItem bundleItem =
                       bundleResult
                               .getItems()
                               .stream()
                               .filter(bundle ->
                                       bundle.getServiceId()
                                               .equals(
                                                       vendorService.getId()
                                               )
                               )
                               .findFirst()
                               .orElse(null);


               if (bundleItem != null) {

                   bundleDiscount =
                           safe(
                                   bundleItem.getDiscountAmount()
                           );

                   if (bundleDiscount.compareTo(
                           BigDecimal.ZERO
                   ) > 0) {

                       bundleApplied = true;
                   }
               }


               qualifyingServiceCount =
                       Math.max(
                               qualifyingServiceCount,
                               vendorServiceIds.size()
                       );
           }


           /*
            * =========================================
            * FINAL SERVICE AMOUNT
            * =========================================
            */

           BigDecimal finalServiceAmount =
                   serviceTotal
                           .subtract(bundleDiscount)
                           .max(BigDecimal.ZERO);


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


           /*
            * Add bundle discount to snapshot.
            */

           BigDecimal existingDiscount =
                   safe(
                           pricingSnapshot
                                   .getDiscountAmount()
                   );


           pricingSnapshot.setDiscountAmount(
                   existingDiscount
                           .add(bundleDiscount)
           );


           pricingSnapshot.setTotalAmount(
                   finalServiceAmount
           );


           booking.setPricingSnapshot(
                   pricingSnapshot
           );


           /*
            * Top-level totals.
            */

           booking.setTotalAmount(
                   finalServiceAmount
           );


           booking.setPaidAmount(
                   BigDecimal.ZERO
           );


           booking.setCreatedAt(
                   LocalDateTime.now()
           );


           /*
            * =========================================
            * SAVE BOOKING
            * =========================================
            */

           booking =
                   bookingRepository.save(
                           booking
                   );


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
                           serviceTotal
                   );


           totalDiscount =
                   totalDiscount.add(
                           bundleDiscount
                   );


           finalTotal =
                   finalTotal.add(
                           finalServiceAmount
                   );
       }


       /*
        * =========================================
        * RETURN BOOKING GROUP
        * =========================================
        */

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
    public BookingResponse getBooking(String bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new BookingNotFoundException("Booking not found"));

        return bookingMapper.toResponse(booking);

    }

    @Override
    public List<BookingResponse> getVendorBookings() {

        String vendorId =
                authenticatedUserService
                        .getCurrentVendor()
                        .getId();

        return bookingRepository
                .findByVendorId(vendorId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();

    }

    @Override
    public List<BookingResponse> getCustomerBookings() {

        String customerId =
                authenticatedUserService
                        .getCurrentUser()
                        .getId();

        return bookingRepository
                .findByCustomerId(customerId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();

    }

   @Override
   public List<BookingResponse> getServiceBookings(String serviceId) {

       String vendorId = authenticatedUserService
               .getCurrentVendor()
               .getId();

       VendorService service = vendorServiceRepository
               .findById(serviceId)
               .orElseThrow(() ->
                       new ResourceNotFoundException("Service not found"));

       if (!service.getVendorId().equals(vendorId)) {
           throw new AccessDeniedException("Access denied.");
       }

       return bookingRepository
               .findByServiceId(serviceId)
               .stream()
               .map(bookingMapper::toResponse)
               .toList();
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

       if (!booking.getCustomerId().equals(customer.getId())) {

           throw new AccessDeniedException(
                   "You cannot view this booking."
           );

       }

       User vendor =
               userRepository
                       .findById(booking.getVendorId())
                       .orElseThrow(() ->
                               new ResourceNotFoundException(
                                       "Vendor not found."
                               ));

       BookingPricingSnapshot snapshot =
               booking.getPricingSnapshot();

       return CustomerBookingDetailsResponse
               .builder()

               .bookingId(booking.getId())
               .bookingNumber(booking.getBookingNumber())

               .serviceId(booking.getServiceId())
               .serviceName(booking.getServiceName())

               .vendorId(vendor.getId())
               .vendorName(vendor.getFullName())
               .vendorPhone(vendor.getPhone())
               .vendorEmail(vendor.getEmail())

               .bookingDate(
                       booking.getCreatedAt().toLocalDate()
               )

               .eventDate(booking.getEventDate())

               .guestCount(booking.getGuestCount())

               .eventType(booking.getEventType())

               .specialRequest(booking.getSpecialRequest())

               .bookingStatus(booking.getStatus())

               .paymentStatus(booking.getPaymentStatus())

               .baseAmount(snapshot.getBaseAmount())
               .subtotal(snapshot.getSubtotal())
               .discountAmount(snapshot.getDiscountAmount())
               .totalAmount(snapshot.getTotalAmount())
               .advanceAmount(snapshot.getAdvanceAmount())
               .balanceAmount(snapshot.getBalanceAmount())

               .paidAmount(booking.getPaidAmount())

               .pricingHeads(snapshot.getPricingHeads())
               .discounts(snapshot.getDiscounts())

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

       String email =
               SecurityUtil.getCurrentUserEmail();
       System.out.println("Logged in email = " + email);
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


}