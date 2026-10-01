package com.booking.mapper.impl;

import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.mapper.*;
import com.booking.model.User;
import com.booking.model.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VendorServiceMapperImpl implements VendorServiceMapper {

    private final ContactInfoMapper contactInfoMapper;

    private final BookingSettingsMapper bookingSettingsMapper;

    private final ServiceDetailSectionMapper
            serviceDetailSectionMapper;

    private final CateringDetailsMapper cateringDetailsMapper;

    @Override
    public VendorService toEntity(
            VendorServiceRequest request,
            User vendor) {

        if (request == null) {
            return null;
        }

        VendorService service = new VendorService();

        service.setVendorId(vendor.getId());

        service.setServiceName(request.getServiceName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());

        service.setCapacity(request.getCapacity());
        service.setDurationHours(request.getDurationHours());

        service.setContactInfo(
                contactInfoMapper.toEntity(
                        request.getContactInfo()
                )
        );

        service.setBookingSettings(
                bookingSettingsMapper.toEntity(
                        request.getBookingSettings()
                )
        );

        service.setImageUrls(request.getImageUrls());

        service.setAmenities(request.getAmenities());

        service.setDetailSections(
                serviceDetailSectionMapper.toEntityList(
                        request.getDetailSections()
                )
        );

        service.setCateringDetails(
                cateringDetailsMapper.toEntity(
                        request.getCateringDetails()
                )
        );

        service.setLocation(
                request.getLocation()
        );

        /*
         * =========================================
         * BUNDLE CONFIGURATION
         * =========================================
         */

        service.setBundleEnabled(
                request.getBundleEnabled()
        );

        service.setBundleDiscountType(
                request.getBundleDiscountType()
        );

        service.setBundleDiscountValue(
                request.getBundleDiscountValue()
        );

        return service;
    }

    @Override
    public VendorServiceResponse toResponse(
            VendorService service) {

        if (service == null) {
            return null;
        }

        VendorServiceResponse response =
                new VendorServiceResponse();

        response.setId(service.getId());

        response.setServiceName(
                service.getServiceName()
        );

        response.setCategory(
                service.getCategory() != null
                        ? service.getCategory().name()
                        : null
        );

        response.setDescription(
                service.getDescription()
        );

        response.setCapacity(
                service.getCapacity()
        );

        response.setDurationHours(
                service.getDurationHours()
        );

        response.setActive(
                service.getActive()
        );

        response.setModerationStatus(
                service.getModerationStatus()
        );

        response.setContactInfo(
                contactInfoMapper.toDto(
                        service.getContactInfo()
                )
        );

        response.setBookingSettings(
                bookingSettingsMapper.toDto(
                        service.getBookingSettings()
                )
        );

        response.setImageUrls(
                service.getImageUrls()
        );

        response.setAmenities(
                service.getAmenities()
        );

        response.setDetailSections(
                serviceDetailSectionMapper.toResponseList(
                        service.getDetailSections()
                )
        );

        response.setCateringDetails(
                cateringDetailsMapper.toResponse(
                        service.getCateringDetails()
                )
        );

        response.setLocation(
                service.getLocation()
        );

        /*
         * Pricing and packages are no longer mapped here.
         *
         * They belong to VendorServicePricing and must be
         * populated by the pricing/service layer.
         */

        response.setBundleEnabled(
                service.getBundleEnabled()
        );

        response.setBundleDiscountType(
                service.getBundleDiscountType()
        );

        response.setBundleDiscountValue(
                service.getBundleDiscountValue()
        );

        return response;
    }

    @Override
    public void updateEntity(
            VendorService entity,
            VendorServiceRequest request) {

        entity.setServiceName(
                request.getServiceName()
        );

        entity.setCategory(
                request.getCategory()
        );

        entity.setDescription(
                request.getDescription()
        );

        entity.setCapacity(
                request.getCapacity()
        );

        entity.setDurationHours(
                request.getDurationHours()
        );

        entity.setContactInfo(
                contactInfoMapper.toEntity(
                        request.getContactInfo()
                )
        );

        entity.setBookingSettings(
                bookingSettingsMapper.toEntity(
                        request.getBookingSettings()
                )
        );

        entity.setImageUrls(
                request.getImageUrls()
        );

        entity.setAmenities(
                request.getAmenities()
        );

        entity.setDetailSections(
                serviceDetailSectionMapper.toEntityList(
                        request.getDetailSections()
                )
        );

        entity.setCateringDetails(
                cateringDetailsMapper.toEntity(
                        request.getCateringDetails()
                )
        );

        entity.setLocation(
                request.getLocation()
        );

        /*
         * =========================================
         * BUNDLE CONFIGURATION
         * =========================================
         */

        entity.setBundleEnabled(
                request.getBundleEnabled()
        );

        entity.setBundleDiscountType(
                request.getBundleDiscountType()
        );

        entity.setBundleDiscountValue(
                request.getBundleDiscountValue()
        );
    }
}