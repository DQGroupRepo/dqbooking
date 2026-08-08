package com.booking.controller;

import com.booking.dto.booking.BookingResponse;
import com.booking.dto.review.ReviewResponse;
import com.booking.dto.servicesettings.ServiceSettingsResponse;
import com.booking.dto.servicesettings.ServiceSettingsRequest;
import com.booking.dto.vendorservice.*;
import com.booking.service.BookingService;
import com.booking.service.ReviewService;
import com.booking.service.ServiceSettingsService;
import com.booking.service.VendorOfferingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/services")
@RequiredArgsConstructor
public class VendorServiceController {

    private final VendorOfferingService vendorOfferingService;

    private final BookingService bookingService;

    private final ReviewService reviewService;

    private final ServiceSettingsService serviceSettingsService;

    @PostMapping
    public ResponseEntity<VendorServiceResponse> createService(
            @Valid @RequestBody VendorServiceRequest request) {

        VendorServiceResponse response =
                vendorOfferingService.createService(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<VendorServiceResponse>> getVendorServices() {

        return ResponseEntity.ok(
                vendorOfferingService.getVendorServices()
        );
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<VendorServiceResponse> getServiceById(
            @PathVariable String serviceId) {

        return ResponseEntity.ok(
                vendorOfferingService.getServiceById(serviceId)
        );
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<VendorServiceResponse> updateService(
            @PathVariable String serviceId,
            @Valid @RequestBody VendorServiceRequest request) {

        return ResponseEntity.ok(
                vendorOfferingService.updateService(serviceId, request)
        );
    }

    @PatchMapping("/{serviceId}/status")
    public ResponseEntity<VendorServiceResponse> changeStatus(
            @PathVariable String serviceId,
            @RequestBody @Valid UpdateServiceStatusRequest request) {

        return ResponseEntity.ok(
                vendorOfferingService.changeStatus(
                        serviceId,
                        request.getActive()
                )
        );
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> deleteService(
            @PathVariable String serviceId) {

        vendorOfferingService.deleteService(serviceId);
        //@TODO OR
        /*vendorService.setActive(false);

        vendorServiceRepository.save(vendorService);*/

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{serviceId}/bookings")
    public ResponseEntity<List<BookingResponse>> getServiceBookings(
            @PathVariable String serviceId) {

        return ResponseEntity.ok(
                bookingService.getServiceBookings(serviceId)
        );
    }

    @GetMapping("/{serviceId}/reviews")
    public List<ReviewResponse> getServiceReviews(
            @PathVariable String serviceId) {

        return reviewService.getServiceReviews(serviceId);
    }

    @GetMapping("/{serviceId}/settings")
    public ResponseEntity<ServiceSettingsResponse> getSettings(
            @PathVariable String serviceId) {

        return ResponseEntity.ok(
                serviceSettingsService.getSettings(serviceId)
        );

    }

    @PutMapping("/{serviceId}/settings")
    public ResponseEntity<ServiceSettingsResponse> updateSettings(
            @PathVariable String serviceId,
            @Valid @RequestBody ServiceSettingsRequest request) {

        return ResponseEntity.ok(
                serviceSettingsService.updateSettings(
                        serviceId,
                        request
                )
        );

    }
}