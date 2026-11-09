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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingSlotServiceImpl
        implements BookingSlotService {

    private static final Logger log =
            LoggerFactory.getLogger(BookingSlotServiceImpl.class);

    private final BookingSlotRepository bookingSlotRepository;

    private final VendorServiceRepository vendorServiceRepository;

    private final BookingSlotMapper bookingSlotMapper;

    @Override
    public BookingSlotResponse createSlot(
            String serviceId,
            CreateBookingSlotRequest request) {

        log.info(
                "Creating booking slot serviceId={} slotName={}",
                serviceId,
                request.getSlotName()
        );

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> {

                    log.warn(
                            "Cannot create booking slot. Service not found serviceId={}",
                            serviceId
                    );

                    return new ResourceNotFoundException(
                            "Vendor Service not found."
                    );
                });

        validateResourceType(service, request.getResourceTypeId());
        validateSlot(request, serviceId);

        BookingSlot bookingSlot =
                bookingSlotMapper.toEntity(request);

        bookingSlot.setServiceId(service.getId());

        bookingSlot.setActive(true);

        bookingSlot =
                bookingSlotRepository.save(bookingSlot);

        log.info(
                "Booking slot created slotId={} serviceId={} slotName={}",
                bookingSlot.getId(),
                serviceId,
                bookingSlot.getSlotName()
        );

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public BookingSlotResponse updateSlot(
            String slotId,
            UpdateBookingSlotRequest request) {

        log.info(
                "Updating booking slot slotId={} slotName={}",
                slotId,
                request.getSlotName()
        );

        BookingSlot bookingSlot =
                bookingSlotRepository.findById(slotId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Cannot update booking slot. Slot not found slotId={}",
                                    slotId
                            );

                            return new ResourceNotFoundException(
                                    "Booking Slot not found."
                            );
                        });

        VendorService service = vendorServiceRepository.findById(bookingSlot.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor Service not found."));
        validateResourceType(service, request.getResourceTypeId());
        validateSlotForUpdate(
                request,
                bookingSlot
        );

        bookingSlotMapper.updateEntity(
                bookingSlot,
                request
        );

        bookingSlot =
                bookingSlotRepository.save(bookingSlot);

        log.info(
                "Booking slot updated slotId={} serviceId={}",
                bookingSlot.getId(),
                bookingSlot.getServiceId()
        );

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public void deleteSlot(String slotId) {

        log.info(
                "Deleting booking slot slotId={}",
                slotId
        );

        BookingSlot bookingSlot =
                bookingSlotRepository.findById(slotId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Cannot delete booking slot. Slot not found slotId={}",
                                    slotId
                            );

                            return new ResourceNotFoundException(
                                    "Booking Slot not found."
                            );
                        });

        bookingSlotRepository.delete(bookingSlot);

        log.info(
                "Booking slot deleted slotId={} serviceId={}",
                slotId,
                bookingSlot.getServiceId()
        );
    }

    @Override
    public BookingSlotResponse getSlot(String slotId) {

        log.debug(
                "Fetching booking slot slotId={}",
                slotId
        );

        BookingSlot bookingSlot =
                bookingSlotRepository.findById(slotId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Booking slot not found slotId={}",
                                    slotId
                            );

                            return new ResourceNotFoundException(
                                    "Booking Slot not found."
                            );
                        });

        return bookingSlotMapper.toResponse(bookingSlot);
    }

    @Override
    public List<BookingSlotResponse> getSlots(
            String serviceId) {

        log.debug(
                "Fetching booking slots serviceId={}",
                serviceId
        );

        List<BookingSlotResponse> responses =
                bookingSlotMapper.toResponseList(
                        bookingSlotRepository
                                .findByServiceIdOrderByDisplayOrderAsc(
                                        serviceId
                                )
                );

        log.info(
                "Booking slots fetched serviceId={} count={}",
                serviceId,
                responses.size()
        );

        return responses;
    }

    /* =======================================================
                    Validation Methods
       ======================================================= */

    private void validateResourceType(VendorService service, String resourceTypeId) {
        if (resourceTypeId == null || resourceTypeId.isBlank()) return;
        boolean exists = service.getResourceTypes() != null && service.getResourceTypes().stream()
                .anyMatch(type -> resourceTypeId.equals(type.getId()) && !Boolean.FALSE.equals(type.getActive()));
        if (!exists) throw new IllegalArgumentException("Selected resource type is not active for this service.");
    }

    private void validateSlot(
            CreateBookingSlotRequest request,
            String serviceId) {

        validateTime(
                request.getStartTime(),
                request.getEndTime()
        );

        if (bookingSlotRepository
                .existsByServiceIdAndSlotNameIgnoreCase(
                        serviceId,
                        request.getSlotName())) {

            log.warn(
                    "Booking slot name already exists serviceId={} slotName={}",
                    serviceId,
                    request.getSlotName()
            );

            throw new ResourceAlreadyExistsException(
                    "Slot name already exists."
            );
        }
    }

    private void validateSlotForUpdate(
            UpdateBookingSlotRequest request,
            BookingSlot existingSlot) {

        validateTime(
                request.getStartTime(),
                request.getEndTime()
        );

        bookingSlotRepository
                .findByServiceIdAndSlotNameIgnoreCase(
                        existingSlot.getServiceId(),
                        request.getSlotName())
                .ifPresent(slot -> {

                    if (!slot.getId()
                            .equals(existingSlot.getId())) {

                        log.warn(
                                "Booking slot name already exists serviceId={} slotName={}",
                                existingSlot.getServiceId(),
                                request.getSlotName()
                        );

                        throw new ResourceAlreadyExistsException(
                                "Slot name already exists."
                        );
                    }
                });
    }

    private void validateTime(
            java.time.LocalTime start,
            java.time.LocalTime end) {

        // A slot whose end time is earlier than its start time represents an
        // overnight interval (for example 11:00 -> 10:00 next day). Equal
        // times are rejected because they would otherwise be ambiguous.
        if (start == null || end == null || start.equals(end)) {

            log.warn(
                    "Invalid booking slot time range startTime={} endTime={}",
                    start,
                    end
            );

            throw new IllegalArgumentException(
                    "Start and end times must be present and must not be equal."
            );
        }
    }

    @Override
    public BookingSlotResponse changeStatus(
            String slotId,
            Boolean active) {

        log.info(
                "Changing booking slot status slotId={} active={}",
                slotId,
                active
        );

        BookingSlot slot =
                bookingSlotRepository.findById(slotId)
                        .orElseThrow(() -> {

                            log.warn(
                                    "Cannot change booking slot status. Slot not found slotId={}",
                                    slotId
                            );

                            return new ResourceNotFoundException(
                                    "Booking Slot not found."
                            );
                        });

        slot.setActive(active);

        slot =
                bookingSlotRepository.save(slot);

        log.info(
                "Booking slot status changed slotId={} active={}",
                slot.getId(),
                slot.getActive()
        );

        return bookingSlotMapper.toResponse(slot);
    }
}