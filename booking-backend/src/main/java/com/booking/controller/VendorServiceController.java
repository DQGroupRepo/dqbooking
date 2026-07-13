package com.booking.controller;

import com.booking.dto.vendorservice.*;
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

}