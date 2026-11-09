package com.booking.service;

import com.booking.dto.service.ServicePackageRequest;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;

import java.util.List;

public interface VendorOfferingService {

    VendorServiceResponse createService(
            VendorServiceRequest request);

    List<VendorServiceResponse> getVendorServices();

    VendorServiceResponse getServiceById(
            String serviceId);

    VendorServiceResponse updateService(
            String serviceId,
            VendorServiceRequest request);

    VendorServiceResponse changeStatus(
            String serviceId,
            Boolean active);

    void deleteService(
            String serviceId);

    List<VendorServiceResponse> getBundleServices(String serviceId);

    /*VendorServiceResponse updatePackages(
            String serviceId,
            List<ServicePackageRequest> packages
    );*/
}