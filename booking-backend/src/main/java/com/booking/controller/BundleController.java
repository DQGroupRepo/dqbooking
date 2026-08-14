package com.booking.controller;

import com.booking.dto.bundle.*;
import com.booking.service.BundleCalculationService;
import com.booking.service.BundleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bundles")
@RequiredArgsConstructor
public class BundleController {

    private final BundleCalculationService bundleCalculationService;

    private final BundleService bundleService;


    /*
     * =========================================
     * BUNDLE CALCULATION
     * =========================================
     */

    @PostMapping("/calculate")
    public BundleCalculationResponse calculateBundle(
            @Valid @RequestBody BundleCalculationRequest request
    ) {

        return bundleCalculationService.calculateBundle(
                request
        );
    }


    /*
     * =========================================
     * CREATE
     * =========================================
     */

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BundleResponse createBundle(
            @Valid @RequestBody CreateBundleRequest request
    ) {

        return bundleService.createBundle(
                request
        );
    }


    /*
     * =========================================
     * GET ONE
     * =========================================
     */

    @GetMapping("/{bundleId}")
    public BundleResponse getBundle(
            @PathVariable String bundleId
    ) {

        return bundleService.getBundle(
                bundleId
        );
    }


    /*
     * =========================================
     * GET VENDOR BUNDLES
     * =========================================
     */

    @GetMapping("/vendor")
    public List<BundleResponse> getVendorBundles() {

        return bundleService.getVendorBundles();
    }


    /*
     * =========================================
     * UPDATE
     * =========================================
     */

    @PutMapping("/{bundleId}")
    public BundleResponse updateBundle(
            @PathVariable String bundleId,
            @Valid @RequestBody UpdateBundleRequest request
    ) {

        return bundleService.updateBundle(
                bundleId,
                request
        );
    }


    /*
     * =========================================
     * DELETE / DEACTIVATE
     * =========================================
     */

    @DeleteMapping("/{bundleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBundle(
            @PathVariable String bundleId
    ) {

        bundleService.deleteBundle(
                bundleId
        );
    }


    /*
     * =========================================
     * ACTIVATE
     * =========================================
     */

    @PatchMapping("/{bundleId}/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activateBundle(
            @PathVariable String bundleId
    ) {

        bundleService.activateBundle(
                bundleId
        );
    }


    /*
     * =========================================
     * DEACTIVATE
     * =========================================
     */

    @PatchMapping("/{bundleId}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateBundle(
            @PathVariable String bundleId
    ) {

        bundleService.deactivateBundle(
                bundleId
        );
    }

    @GetMapping("/service/{serviceId}")
    public List<BundleResponse> getBundlesForService(
            @PathVariable String serviceId
    ) {

        return bundleService.getBundlesForService(
                serviceId
        );
    }
}