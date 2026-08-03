package com.booking.service.impl;

import com.booking.dto.booking.BookingCancellationResponse;
import com.booking.dto.booking.BookingResponse;
import com.booking.dto.booking.CreateBookingRequest;
import com.booking.dto.booking.CustomerBookingDetailsResponse;
import com.booking.dto.pricing.PricingCalculationResult;
import com.booking.exception.BookingNotFoundException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.helper.BookingHelper;
import com.booking.mapper.BookingMapper;
import com.booking.model.*;
import com.booking.model.embedded.BookingDiscountSnapshot;
import com.booking.model.embedded.BookingPricingHeadSnapshot;
import com.booking.model.embedded.BookingPricingSnapshot;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.NotificationType;
import com.booking.model.enums.PaymentStatus;
import com.booking.repository.*;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.BookingService;
import com.booking.service.NotificationService;
import com.booking.service.PricingCalculationService;
import com.booking.util.BookingNumberGenerator;
import com.booking.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService
       {

    private final BookingRepository bookingRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final AuthenticatedUserService authenticatedUserService;

    private final BookingNumberGenerator bookingNumberGenerator;

    private final BookingMapper bookingMapper;

    private final BookingHelper bookingHelper;

    private final VendorRepository vendorRepository;

    private final NotificationService notificationService;

    private final PricingCalculationService pricingCalculationService;

   private final UserRepository userRepository;

   private final VendorServicePricingRepository pricingRepository;

           @Override
           public BookingResponse createBooking(
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
                * 2. FIND ACTIVE SERVICE
                * =========================================
                */

               VendorService vendorService =
                       vendorServiceRepository
                               .findByIdAndActiveTrueAndDeletedFalse(
                                       request.getServiceId()
                               )
                               .orElseThrow(() ->
                                       new ResourceNotFoundException(
                                               "Service not found"
                                       )
                               );


               /*
                * =========================================
                * 3. FIND VENDOR
                * =========================================
                */

               Vendor vendor =
                       vendorRepository
                               .findById(
                                       vendorService.getVendorId()
                               )
                               .orElseThrow(() ->
                                       new ResourceNotFoundException(
                                               "Vendor not found"
                                       )
                               );


               /*
                * =========================================
                * 4. CALCULATE PRICING
                * =========================================
                *
                * The pricing engine finds the applicable
                * pricing version based on:
                *
                * serviceId
                * eventDate
                *
                * It calculates:
                *
                * Base Amount
                * Pricing Heads
                * Subtotal
                * Discounts
                * Total
                * Advance
                * Balance
                */

               PricingCalculationResult pricingResult =
                       pricingCalculationService.calculatePrice(
                               request.getServiceId(),
                               request.getEventDate()
                       );


               /*
                * =========================================
                * 5. CREATE BOOKING
                * =========================================
                */

               Booking booking =
                       new Booking();


               booking.setBookingNumber(
                       bookingNumberGenerator.generate()
               );


               booking.setCustomerId(
                       customer.getId()
               );


               booking.setEventDate(
                       request.getEventDate()
               );


               booking.setGuestCount(
                       request.getGuestCount()
               );


               booking.setSpecialRequest(
                       request.getSpecialRequest()
               );


               booking.setEventType(
                       request.getEventType()
               );


               /*
                * =========================================
                * 6. PREPARE BOOKING SNAPSHOTS
                * =========================================
                */

               bookingHelper.prepareBooking(
                       booking,
                       vendorService,
                       customer,
                       vendor
               );


               /*
                * =========================================
                * 7. CREATE PRICING SNAPSHOT
                * =========================================
                *
                * The pricing result is converted into a
                * permanent snapshot.
                *
                * Future vendor pricing changes will NOT
                * affect this booking.
                */

               BookingPricingSnapshot pricingSnapshot =
                       createPricingSnapshot(
                               pricingResult
                       );


               booking.setPricingSnapshot(
                       pricingSnapshot
               );


               /*
                * Keep these top-level values for
                * existing dashboard/revenue logic.
                */

               booking.setTotalAmount(
                       pricingResult.getTotalAmount()
               );


               booking.setPaidAmount(
                       BigDecimal.ZERO
               );


               /*
                * =========================================
                * 8. SAVE BOOKING
                * =========================================
                */

               booking =
                       bookingRepository.save(
                               booking
                       );


               /*
                * =========================================
                * 9. CREATE VENDOR NOTIFICATION
                * =========================================
                */

               notificationService.createNotification(
                       vendor.getUserId(),

                       NotificationType.BOOKING,

                       "New Booking",

                       customer.getFullName()
                               + " booked "
                               + booking.getServiceName(),

                       booking.getId()
               );


               /*
                * =========================================
                * 10. RETURN RESPONSE
                * =========================================
                */

               return bookingMapper.toResponse(
                       booking
               );
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

       /*
        * Ownership validation
        */

       if (!booking.getCustomerId().equals(customer.getId())) {

           throw new AccessDeniedException(
                   "You cannot cancel this booking."
           );

       }

       /*
        * Already cancelled?
        */

       if (booking.getStatus() == BookingStatus.CANCELLED) {

           throw new IllegalStateException(
                   "Booking is already cancelled."
           );

       }

       /*
        * Completed booking cannot be cancelled
        */

       if (booking.getStatus() == BookingStatus.COMPLETED) {

           throw new IllegalStateException(
                   "Completed booking cannot be cancelled."
           );

       }

       /*
        * Event already started
        */

       if (booking.getEventDate().isBefore(LocalDate.now())) {

           throw new IllegalStateException(
                   "Past bookings cannot be cancelled."
           );

       }

       /*
        * TODO
        * Calculate cancellation charges
        */

       BigDecimal cancellationCharge =
               BigDecimal.ZERO;

       BigDecimal refundableAmount =
               booking.getPaidAmount();

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
                       cancellationCharge
               )

               .refundableAmount(
                       refundableAmount
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

       throw new UnsupportedOperationException(
               "Booking details API not implemented yet."
       );

   }
}