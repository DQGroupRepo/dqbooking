package com.booking.service.impl;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.booking.CreateBookingRequest;
import com.booking.exception.BookingNotFoundException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.helper.BookingHelper;
import com.booking.mapper.BookingMapper;
import com.booking.model.Booking;
import com.booking.model.User;
import com.booking.model.Vendor;
import com.booking.model.VendorService;
import com.booking.repository.BookingRepository;
import com.booking.repository.VendorRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.BookingService;
import com.booking.util.BookingNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

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

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {

        User customer = authenticatedUserService.getCurrentCustomer();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndActiveTrueAndDeletedFalse(request.getServiceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Service not found"));

        Booking booking = new Booking();

        booking.setBookingNumber(
                bookingNumberGenerator.generate()
        );

        booking.setCustomerId(customer.getId());

        booking.setEventDate(request.getEventDate());

        booking.setGuestCount(request.getGuestCount());

        booking.setSpecialRequest(request.getSpecialRequest());

        booking.setEventType(request.getEventType());

        Vendor vendor = vendorRepository
                .findById(vendorService.getVendorId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vendor not found"));
        bookingHelper.prepareBooking(
                booking,
                vendorService,
                customer,
                vendor
        );

        booking = bookingRepository.save(booking);

        return bookingMapper.toResponse(booking);

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
}