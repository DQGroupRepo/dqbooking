package com.booking.service.impl;

import com.booking.dto.pricing.VendorServicePricingRequest;
import com.booking.dto.pricing.PaymentConfigurationRequest;
import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.mapper.VendorServiceMapper;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.AuthenticatedUserService;
import com.booking.service.VendorServicePricingService;
import com.booking.service.storage.StorageService;
import com.booking.service.VendorOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorOfferingServiceImpl implements VendorOfferingService {

    private final VendorServiceRepository vendorServiceRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final VendorServiceMapper vendorServiceMapper;
    private final StorageService storageService;
    private final VendorServicePricingService vendorServicePricingService;


    @Override
    public VendorServiceResponse createService(
            VendorServiceRequest request) {

        User vendor =
                authenticatedUserService.getCurrentVendor();

        VendorService vendorService =
                vendorServiceMapper.toEntity(request, vendor);

        vendorService =
                vendorServiceRepository.save(vendorService);

        VendorServicePricingRequest pricing =
                new VendorServicePricingRequest();

        pricing.setServiceId(vendorService.getId());

        pricing.setEffectiveFrom(LocalDate.now());

        pricing.setBaseAmount(vendorService.getPrice());

        pricing.setPricingHeads(new ArrayList<>());

        pricing.setDiscounts(new ArrayList<>());

        pricing.setPaymentConfiguration(
                new PaymentConfigurationRequest()
        );

        vendorServicePricingService.createPricing(pricing);

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public VendorServiceResponse updateService(String serviceId,
                                               VendorServiceRequest request) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        vendorServiceMapper.updateEntity(vendorService, request);

        vendorService =
                vendorServiceRepository.save(vendorService);

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public void deleteService(String serviceId) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        vendorService.setDeleted(true);
        vendorService.setActive(false);

        vendorServiceRepository.save(vendorService);
    }

    @Override
    public VendorServiceResponse getServiceById(String serviceId) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        return vendorServiceMapper.toResponse(vendorService);
    }

    @Override
    public List<VendorServiceResponse> getVendorServices() {

        User vendor = authenticatedUserService.getCurrentVendor();

        return vendorServiceRepository
                .findByVendorIdAndDeletedFalse(vendor.getId())
                .stream()
                .map(vendorServiceMapper::toResponse)
                .toList();
    }

    @Override
    public VendorServiceResponse changeStatus(String serviceId,
                                              Boolean active) {

        User vendor = authenticatedUserService.getCurrentVendor();

        VendorService vendorService = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(serviceId, vendor.getId())
                .orElseThrow(() ->
                        new VendorServiceNotFoundException("Service not found"));

        vendorService.setActive(active);

        vendorService = vendorServiceRepository.save(vendorService);

        return vendorServiceMapper.toResponse(vendorService);
    }

}