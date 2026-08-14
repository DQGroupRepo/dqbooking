package com.booking.service;

import com.booking.dto.bundle.BundleResponse;
import com.booking.dto.bundle.CreateBundleRequest;
import com.booking.dto.bundle.UpdateBundleRequest;

import java.util.List;

public interface BundleService {

    BundleResponse createBundle(
            CreateBundleRequest request
    );

    BundleResponse getBundle(
            String bundleId
    );

    List<BundleResponse> getVendorBundles();

    BundleResponse updateBundle(
            String bundleId,
            UpdateBundleRequest request
    );

    void deleteBundle(
            String bundleId
    );

    void activateBundle(
            String bundleId
    );

    void deactivateBundle(
            String bundleId
    );

    List<BundleResponse> getBundlesForService(
            String serviceId
    );
}