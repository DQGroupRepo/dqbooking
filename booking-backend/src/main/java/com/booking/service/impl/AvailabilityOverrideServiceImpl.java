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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityOverrideServiceImpl
        implements AvailabilityOverrideService {

    private static final Logger log =
            LoggerFactory.getLogger(AvailabilityOverrideServiceImpl.class);

    private final AvailabilityOverrideRepository repository;

    private final VendorServiceRepository vendorServiceRepository;

    private final BookingSlotRepository bookingSlotRepository;

    private final AvailabilityOverrideMapper mapper;

    @Override
    public AvailabilityOverrideResponse createOverride(
            String serviceId,
            CreateAvailabilityOverrideRequest request) {

        log.info(
                "Creating availability override serviceId={} slotId={} date={}",
                serviceId,
                request.getSlotId(),
                request.getDate()
        );

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> {
                    log.warn(
                            "Cannot create availability override. Service not found serviceId={}",
                            serviceId
                    );

                    return new ResourceNotFoundException(
                            "Vendor Service not found."
                    );
                });

        BookingSlot slot = bookingSlotRepository.findById(
                        request.getSlotId())
                .orElseThrow(() -> {
                    log.warn(
                            "Cannot create availability override. Booking slot not found slotId={}",
                            request.getSlotId()
                    );

                    return new ResourceNotFoundException(
                            "Booking Slot not found."
                    );
                });

        if (!slot.getServiceId().equals(serviceId)) {

            log.warn(
                    "Booking slot does not belong to service serviceId={} slotId={}",
                    serviceId,
                    request.getSlotId()
            );

            throw new IllegalArgumentException(
                    "Booking Slot does not belong to this service."
            );
        }

        validateOverride(request.getCapacityOverride());

        if (repository.existsByServiceIdAndSlotIdAndDate(
                serviceId,
                request.getSlotId(),
                request.getDate())) {

            log.warn(
                    "Availability override already exists serviceId={} slotId={} date={}",
                    serviceId,
                    request.getSlotId(),
                    request.getDate()
            );

            throw new ResourceAlreadyExistsException(
                    "Availability override already exists."
            );
        }

        AvailabilityOverride override =
                mapper.toEntity(request);

        override.setServiceId(service.getId());

        override = repository.save(override);

        log.info(
                "Availability override created overrideId={} serviceId={} slotId={} date={}",
                override.getId(),
                serviceId,
                request.getSlotId(),
                request.getDate()
        );

        return mapper.toResponse(override);
    }

    @Override
    public AvailabilityOverrideResponse updateOverride(
            String overrideId,
            UpdateAvailabilityOverrideRequest request) {

        log.info(
                "Updating availability override overrideId={}",
                overrideId
        );

        AvailabilityOverride override =
                getOverrideEntity(overrideId);

        validateOverride(request.getCapacityOverride());

        mapper.updateEntity(
                override,
                request
        );

        override = repository.save(override);

        log.info(
                "Availability override updated overrideId={} serviceId={} date={}",
                override.getId(),
                override.getServiceId(),
                override.getDate()
        );

        return mapper.toResponse(override);
    }

    @Override
    public void deleteOverride(
            String overrideId) {

        log.info(
                "Deleting availability override overrideId={}",
                overrideId
        );

        AvailabilityOverride override =
                getOverrideEntity(overrideId);

        repository.delete(override);

        log.info(
                "Availability override deleted overrideId={} serviceId={} date={}",
                overrideId,
                override.getServiceId(),
                override.getDate()
        );
    }

    @Override
    public AvailabilityOverrideResponse getOverride(
            String overrideId) {

        log.debug(
                "Fetching availability override overrideId={}",
                overrideId
        );

        return mapper.toResponse(
                getOverrideEntity(overrideId)
        );
    }

    @Override
    public List<AvailabilityOverrideResponse> getOverrides(
            String serviceId,
            LocalDate date) {

        log.debug(
                "Fetching availability overrides serviceId={} date={}",
                serviceId,
                date
        );

        List<AvailabilityOverrideResponse> responses =
                mapper.toResponseList(
                        repository.findByServiceIdAndDateOrderByCreatedTsAsc(
                                serviceId,
                                date
                        )
                );

        log.info(
                "Availability overrides fetched serviceId={} date={} count={}",
                serviceId,
                date,
                responses.size()
        );

        return responses;
    }

    /* =======================================================
                    Private Helper Methods
       ======================================================= */

    private AvailabilityOverride getOverrideEntity(
            String overrideId) {

        return repository.findById(overrideId)

                .orElseThrow(() -> {

                    log.warn(
                            "Availability override not found overrideId={}",
                            overrideId
                    );

                    return new ResourceNotFoundException(
                            "Availability Override not found."
                    );
                });
    }

    private void validateOverride(
            Integer maxBookingsOverride) {

        if (maxBookingsOverride != null
                && maxBookingsOverride < 0) {

            log.warn(
                    "Invalid availability capacity override value={}",
                    maxBookingsOverride
            );

            throw new IllegalArgumentException(
                    "Maximum bookings override cannot be negative."
            );
        }
    }
}