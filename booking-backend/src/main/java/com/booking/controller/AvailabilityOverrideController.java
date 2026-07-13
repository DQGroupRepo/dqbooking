package com.booking.controller;

import com.booking.dto.availability.AvailabilityOverrideResponse;
import com.booking.dto.availability.CreateAvailabilityOverrideRequest;
import com.booking.dto.availability.UpdateAvailabilityOverrideRequest;
import com.booking.service.AvailabilityOverrideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/services/{serviceId}/availability")
@RequiredArgsConstructor
public class AvailabilityOverrideController {

    private final AvailabilityOverrideService availabilityOverrideService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AvailabilityOverrideResponse createOverride(

            @PathVariable String serviceId,

            @Valid
            @RequestBody
            CreateAvailabilityOverrideRequest request) {

        return availabilityOverrideService.createOverride(
                serviceId,
                request
        );

    }

    @GetMapping
    public List<AvailabilityOverrideResponse> getOverrides(

            @PathVariable String serviceId,

            @RequestParam LocalDate date) {

        return availabilityOverrideService.getOverrides(
                serviceId,
                date
        );

    }

    @GetMapping("/{overrideId}")
    public AvailabilityOverrideResponse getOverride(

            @PathVariable String overrideId) {

        return availabilityOverrideService.getOverride(
                overrideId
        );

    }

    @PutMapping("/{overrideId}")
    public AvailabilityOverrideResponse updateOverride(

            @PathVariable String overrideId,

            @Valid
            @RequestBody
            UpdateAvailabilityOverrideRequest request) {

        return availabilityOverrideService.updateOverride(
                overrideId,
                request
        );

    }

    @DeleteMapping("/{overrideId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOverride(

            @PathVariable String overrideId) {

        availabilityOverrideService.deleteOverride(
                overrideId
        );

    }

}