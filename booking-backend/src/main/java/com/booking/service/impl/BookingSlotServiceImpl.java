package com.booking.service.impl;

import com.booking.dto.bookingslot.BookingSlotResponse;
import com.booking.dto.bookingslot.CreateBookingSlotRequest;
import com.booking.dto.bookingslot.UpdateBookingSlotRequest;
import com.booking.exception.ResourceAlreadyExistsException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.mapper.BookingSlotMapper;
import com.booking.model.BookingSlot;
import com.booking.model.VendorService;
import com.booking.repository.BookingSlotRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.BookingSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingSlotServiceImpl implements BookingSlotService {

    private final BookingSlotRepository bookingSlotRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final BookingSlotMapper bookingSlotMapper;

    @Override
    public BookingSlotResponse createSlot(
            String serviceId,
            CreateBookingSlotRequest request) {

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vendor Service not found."));

        validateSlot(request, serviceId);

        BookingSlot bookingSlot = bookingSlotMapper.toEntity(request);

        bookingSlot.setServiceId(service.getId());

        bookingSlot.setActive(true);

        bookingSlot = bookingSlotRepository.save(bookingSlot);

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public BookingSlotResponse updateSlot(
            String slotId,
            UpdateBookingSlotRequest request) {

        BookingSlot bookingSlot = bookingSlotRepository.findById(slotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking Slot not found."));

        validateSlotForUpdate(request, bookingSlot);

        bookingSlotMapper.updateEntity(bookingSlot, request);

        bookingSlot = bookingSlotRepository.save(bookingSlot);

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public void deleteSlot(String slotId) {

        BookingSlot bookingSlot = bookingSlotRepository.findById(slotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking Slot not found."));

        bookingSlotRepository.delete(bookingSlot);
    }

    @Override
    public BookingSlotResponse getSlot(String slotId) {

        BookingSlot bookingSlot = bookingSlotRepository.findById(slotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking Slot not found."));

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public List<BookingSlotResponse> getSlots(String serviceId) {

        return bookingSlotMapper.toResponseList(

                bookingSlotRepository
                        .findByServiceIdOrderByDisplayOrderAsc(serviceId)

        );
    }

    /* =======================================================
                    Validation Methods
       ======================================================= */

    private void validateSlot(
            CreateBookingSlotRequest request,
            String serviceId) {

        validateTime(request.getStartTime(), request.getEndTime());

        if (bookingSlotRepository.existsByServiceIdAndSlotNameIgnoreCase(
                serviceId,
                request.getSlotName())) {

            throw new ResourceAlreadyExistsException(
                    "Slot name already exists.");
        }
    }

    private void validateSlotForUpdate(
            UpdateBookingSlotRequest request,
            BookingSlot existingSlot) {

        validateTime(request.getStartTime(), request.getEndTime());

        bookingSlotRepository
                .findByServiceIdAndSlotNameIgnoreCase(
                        existingSlot.getServiceId(),
                        request.getSlotName())
                .ifPresent(slot -> {

                    if (!slot.getId().equals(existingSlot.getId())) {

                        throw new ResourceAlreadyExistsException(
                                "Slot name already exists.");
                    }

                });
    }

    private void validateTime(
            java.time.LocalTime start,
            java.time.LocalTime end) {

        if (!end.isAfter(start)) {

            throw new IllegalArgumentException(
                    "End time must be after start time.");

        }

    }

    @Override
    public BookingSlotResponse changeStatus(
            String slotId,
            Boolean active) {

        BookingSlot slot = bookingSlotRepository.findById(slotId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking Slot not found."));

        slot.setActive(active);

        slot = bookingSlotRepository.save(slot);

        return bookingSlotMapper.toResponse(slot);
    }

}