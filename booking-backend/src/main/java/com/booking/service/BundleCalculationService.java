package com.booking.service;

import com.booking.dto.bundle.BundleCalculationRequest;
import com.booking.dto.bundle.BundleCalculationResponse;

public interface BundleCalculationService {

    BundleCalculationResponse calculateBundle(
            BundleCalculationRequest request
    );
}