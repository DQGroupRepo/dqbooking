package com.booking.mapper.impl;

import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.mapper.AvailabilityMapper;
import com.booking.mapper.BookingSettingsMapper;
import com.booking.mapper.ContactInfoMapper;
import com.booking.mapper.ServiceAttributeMapper;
import com.booking.mapper.VendorServiceMapper;
import com.booking.model.Vendor;
import com.booking.model.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VendorServiceMapperImpl implements VendorServiceMapper {

    private final ContactInfoMapper contactInfoMapper;

    private final AvailabilityMapper availabilityMapper;

    private final BookingSettingsMapper bookingSettingsMapper;

    private final ServiceAttributeMapper serviceAttributeMapper;

    @Override
    public VendorService toEntity(
            VendorServiceRequest request,
            Vendor vendor) {

        if (request == null) {
            return null;
        }

        VendorService service = new VendorService();

        service.setVendorId(vendor.getId());

        service.setServiceName(request.getServiceName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        if (request.getPricing() != null) {

            service.setPrice(
                    request.getPricing().getBaseAmount()
            );

        } else {

            service.setPrice(
                    request.getPrice()
            );

        }
        service.setCapacity(request.getCapacity());
        service.setDurationHours(request.getDurationHours());

        service.setContactInfo(
                contactInfoMapper.toEntity(request.getContactInfo())
        );

        service.setAvailability(
                availabilityMapper.toEntity(request.getAvailability())
        );

        service.setBookingSettings(
                bookingSettingsMapper.toEntity(request.getBookingSettings())
        );

        service.setImageUrls(request.getImageUrls());

        service.setAmenities(request.getAmenities());

        service.setAttributes(
                serviceAttributeMapper.toEntityList(request.getAttributes())
        );
        service.setLocation(request.getLocation());

        return service;
    }

    @Override
    public VendorServiceResponse toResponse(VendorService service) {

        if (service == null) {
            return null;
        }

        VendorServiceResponse response = new VendorServiceResponse();

        response.setId(service.getId());
        response.setServiceName(service.getServiceName());
        response.setCategory(service.getCategory().name());
        response.setDescription(service.getDescription());
        response.setPrice(service.getPrice());
        response.setCapacity(service.getCapacity());
        response.setDurationHours(service.getDurationHours());

        response.setActive(service.getActive());
        response.setFeatured(service.getFeatured());
        response.setPricingConfigured(false);

        response.setContactInfo(
                contactInfoMapper.toDto(service.getContactInfo())
        );

        response.setAvailability(
                availabilityMapper.toDto(service.getAvailability())
        );

        response.setBookingSettings(
                bookingSettingsMapper.toDto(service.getBookingSettings())
        );

        response.setImageUrls(service.getImageUrls());

        response.setAmenities(service.getAmenities());

        response.setAttributes(
                serviceAttributeMapper.toDtoList(service.getAttributes())
        );
        response.setLocation(service.getLocation());

        return response;
    }

    @Override
    public void updateEntity(
            VendorService entity,
            VendorServiceRequest request) {

        entity.setServiceName(request.getServiceName());
        entity.setCategory(request.getCategory());
        entity.setDescription(request.getDescription());
        if (request.getPricing() != null) {

            entity.setPrice(
                    request.getPricing().getBaseAmount()
            );

        } else {

            entity.setPrice(
                    request.getPrice()
            );

        }
        entity.setCapacity(request.getCapacity());
        entity.setDurationHours(request.getDurationHours());

        entity.setContactInfo(
                contactInfoMapper.toEntity(request.getContactInfo())
        );

        entity.setAvailability(
                availabilityMapper.toEntity(request.getAvailability())
        );

        entity.setBookingSettings(
                bookingSettingsMapper.toEntity(request.getBookingSettings())
        );

        entity.setImageUrls(request.getImageUrls());

        entity.setAmenities(request.getAmenities());

        entity.setAttributes(
                serviceAttributeMapper.toEntityList(request.getAttributes())
        );
    }
}