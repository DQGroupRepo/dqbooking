package com.booking.service.impl;

import com.booking.dto.availability.AvailabilityOverrideResponse;
import com.booking.dto.availability.CreateAvailabilityOverrideRequest;
import com.booking.dto.availability.UpdateAvailabilityOverrideRequest;
import com.booking.exception.ResourceAlreadyExistsException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.mapper.AvailabilityOverrideMapper;
import com.booking.model.AvailabilityOverride;
import com.booking.model.BookingSlot;
import com.booking.model.VendorService;
import com.booking.repository.AvailabilityOverrideRepository;
import com.booking.repository.BookingSlotRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AvailabilityOverrideService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityOverrideServiceImpl
        implements AvailabilityOverrideService {

    private final AvailabilityOverrideRepository repository;

    private final VendorServiceRepository vendorServiceRepository;

    private final BookingSlotRepository bookingSlotRepository;

    private final AvailabilityOverrideMapper mapper;

    @Override
    public AvailabilityOverrideResponse createOverride(
            String serviceId,
            CreateAvailabilityOverrideRequest request) {

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vendor Service not found."
                        ));

        BookingSlot slot = bookingSlotRepository.findById(
                        request.getSlotId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking Slot not found."
                        ));

        if (!slot.getServiceId().equals(serviceId)) {

            throw new IllegalArgumentException(
                    "Booking Slot does not belong to this service."
            );

        }

        validateOverride(request.getCapacityOverride());

        if (repository.existsByServiceIdAndSlotIdAndDate(
                serviceId,
                request.getSlotId(),
                request.getDate())) {

            throw new ResourceAlreadyExistsException(
                    "Availability override already exists."
            );

        }

        AvailabilityOverride override =
                mapper.toEntity(request);

        override.setServiceId(service.getId());

        override = repository.save(override);

        return mapper.toResponse(override);

    }

    @Override
    public AvailabilityOverrideResponse updateOverride(
            String overrideId,
            UpdateAvailabilityOverrideRequest request) {

        AvailabilityOverride override =
                getOverrideEntity(overrideId);

        validateOverride(request.getCapacityOverride());

        mapper.updateEntity(
                override,
                request
        );

        override = repository.save(override);

        return mapper.toResponse(override);

    }

    @Override
    public void deleteOverride(
            String overrideId) {

        AvailabilityOverride override =
                getOverrideEntity(overrideId);

        repository.delete(override);

    }

    @Override
    public AvailabilityOverrideResponse getOverride(
            String overrideId) {

        return mapper.toResponse(

                getOverrideEntity(overrideId)

        );

    }

    @Override
    public List<AvailabilityOverrideResponse> getOverrides(
            String serviceId,
            LocalDate date) {

        return mapper.toResponseList(

                repository.findByServiceIdAndDateOrderByCreatedAtAsc(
                        serviceId,
                        date
                )

        );

    }

    /* =======================================================
                    Private Helper Methods
       ======================================================= */

    private AvailabilityOverride getOverrideEntity(
            String overrideId) {

        return repository.findById(overrideId)

                .orElseThrow(() ->

                        new ResourceNotFoundException(
                                "Availability Override not found."
                        ));

    }

    private void validateOverride(
            Integer maxBookingsOverride) {

        if (maxBookingsOverride != null
                && maxBookingsOverride < 0) {

            throw new IllegalArgumentException(
                    "Maximum bookings override cannot be negative."
            );

        }

    }

}