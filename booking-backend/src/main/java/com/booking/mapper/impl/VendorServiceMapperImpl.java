package com.booking.mapper.impl;

import com.booking.dto.vendorservice.VendorServiceRequest;
import com.booking.dto.vendorservice.VendorServiceResponse;
import com.booking.mapper.*;
import com.booking.model.User;
import com.booking.model.VendorService;
import com.booking.model.embedded.ServiceTag;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

        service.setFacilities(normalizeAttributeValues(request.getFacilities()));
        service.setAmenities(normalizeAttributeValues(request.getAmenities()));

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
        if (request.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP) validateBeautyDetails(request.getBeautyDetails(), request.getBookingSettings());
        service.setBeautyDetails(request.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP
                ? request.getBeautyDetails() : null);

        service.setLocation(
                request.getLocation()
        );
        service.setTags(normalizeTags(request.getTags(), request.getCategory(), request.getLocation()));

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

        response.setFacilities(service.getFacilities() == null ? new ArrayList<>() : service.getFacilities());

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
        response.setBeautyDetails(service.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP
                ? service.getBeautyDetails() : null);

        response.setLocation(
                service.getLocation()
        );
        response.setTags(service.getTags() == null ? new ArrayList<>() : service.getTags());

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

        entity.setFacilities(normalizeAttributeValues(request.getFacilities()));

        entity.setAmenities(normalizeAttributeValues(request.getAmenities()));

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
        if (request.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP) validateBeautyDetails(request.getBeautyDetails(), request.getBookingSettings());
        entity.setBeautyDetails(request.getCategory() == com.booking.model.enums.ServiceCategory.MAKEUP
                ? request.getBeautyDetails() : null);

        entity.setLocation(
                request.getLocation()
        );
        entity.setTags(normalizeTags(request.getTags(), request.getCategory(), request.getLocation()));

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



    private void validateBeautyDetails(com.booking.model.embedded.BeautyDetails details,
                                       com.booking.dto.vendorservice.BookingSettingsDto settings) {
        if (details == null || details.getOpeningTime() == null || details.getClosingTime() == null
                || !details.getClosingTime().isAfter(details.getOpeningTime())) {
            throw new IllegalArgumentException("Configure valid Beauty shop opening and closing times.");
        }
        if (settings == null || settings.getMaxSimultaneousBookings() == null || settings.getMaxSimultaneousBookings() < 1) {
            throw new IllegalArgumentException("Set maximum simultaneous customers to at least one for Beauty services.");
        }
        List<com.booking.model.embedded.BeautyServiceItem> services = details.getServices() == null ? List.of() : details.getServices();
        java.util.Set<String> ids = new java.util.HashSet<>();
        for (var item : services) {
            if (item == null || item.getId() == null || item.getId().isBlank() || !ids.add(item.getId())
                    || item.getName() == null || item.getName().isBlank() || item.getPrice() == null
                    || item.getPrice().signum() < 0) {
                throw new IllegalArgumentException("Each Beauty service needs a unique ID, name and non-negative price.");
            }
        }
        long activeCount = services.stream().filter(com.booking.model.embedded.BeautyServiceItem::isActive).count();
        if (activeCount < 1) throw new IllegalArgumentException("Add at least one active Beauty service before publishing.");
        List<com.booking.model.embedded.BeautyDurationRule> rules = details.getDurationRules() == null ? List.of() : details.getDurationRules();
        List<com.booking.model.embedded.BeautyDurationRule> sorted = rules.stream()
                .sorted(java.util.Comparator.comparing(com.booking.model.embedded.BeautyDurationRule::getMinServices,
                        java.util.Comparator.nullsFirst(Integer::compareTo))).toList();
        int expected = 1;
        for (var rule : sorted) {
            if (rule.getMinServices() == null || rule.getMaxServices() == null || rule.getDurationMinutes() == null
                    || rule.getMinServices() != expected || rule.getMaxServices() < rule.getMinServices()
                    || rule.getDurationMinutes() < 1 || rule.getMaxServices() > activeCount) {
                throw new IllegalArgumentException("Beauty duration rules must cover every service count from 1 to the number of active services without gaps or overlaps.");
            }
            expected = rule.getMaxServices() + 1;
        }
        if (activeCount > 0 && expected != activeCount + 1) {
            throw new IllegalArgumentException("Beauty duration rules must cover every service count from 1 to the number of active services.");
        }
        List<com.booking.model.embedded.BeautyBreak> breaks = details.getBreaks() == null ? List.of() : details.getBreaks();
        var orderedBreaks = breaks.stream().sorted(java.util.Comparator.comparing(com.booking.model.embedded.BeautyBreak::getStartTime,
                java.util.Comparator.nullsFirst(java.time.LocalTime::compareTo))).toList();
        java.time.LocalTime previousEnd = details.getOpeningTime();
        for (var block : orderedBreaks) {
            if (block.getStartTime() == null || block.getEndTime() == null
                    || !block.getEndTime().isAfter(block.getStartTime())
                    || block.getStartTime().isBefore(details.getOpeningTime())
                    || block.getEndTime().isAfter(details.getClosingTime())
                    || block.getStartTime().isBefore(previousEnd)) {
                throw new IllegalArgumentException("Beauty breaks must be valid, within shop hours and non-overlapping.");
            }
            previousEnd = block.getEndTime();
        }
    }

    private List<String> normalizeAttributeValues(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new ArrayList<>();
        }
        List<String> result = new ArrayList<>();
        for (String value : values) {
            if (value == null || value.isBlank()) {
                continue;
            }
            String cleaned = value.trim().replaceAll("\\s+", " ");
            String normalized = normalize(cleaned);
            boolean duplicate = result.stream()
                    .anyMatch(existing -> normalize(existing).equals(normalized));
            if (!duplicate && cleaned.length() <= 80) {
                result.add(cleaned);
            }
        }
        return result;
    }

    private List<ServiceTag> normalizeTags(List<ServiceTag> supplied,
                                           com.booking.model.enums.ServiceCategory category,
                                           String location) {
        List<ServiceTag> source = supplied == null ? new ArrayList<>() : supplied;
        List<ServiceTag> result = new ArrayList<>();
        for (ServiceTag tag : source) {
            if (tag == null || tag.getType() == null || tag.getValue() == null || tag.getValue().isBlank()) continue;
            String type = tag.getType().trim().toUpperCase(Locale.ROOT);
            if (!type.equals("CATEGORY") && !type.equals("LOCATION")) continue;
            String value = tag.getValue().trim().replaceAll("\\s+", " ");
            String normalized = normalize(value);
            if (result.stream().noneMatch(t -> t.getType().equals(type) && t.getNormalizedName().equals(normalized))) {
                List<String> aliases = tag.getAliases() == null ? new ArrayList<>() : tag.getAliases().stream()
                        .filter(a -> a != null && !a.isBlank()).map(this::normalize).distinct().toList();
                result.add(new ServiceTag(type, value, normalized, new ArrayList<>(aliases)));
            }
        }
        // If a tag type has no vendor-selected tags, use its primary field as the default.
        if (result.stream().noneMatch(t -> t.getType().equals("CATEGORY")) && category != null) {
            String value = category.name().replace('_', ' ');
            result.add(new ServiceTag("CATEGORY", value, normalize(value), new ArrayList<>()));
        }
        if (result.stream().noneMatch(t -> t.getType().equals("LOCATION")) && location != null && !location.isBlank()) {
            String value = location.trim().replaceAll("\\s+", " ");
            result.add(new ServiceTag("LOCATION", value, normalize(value), new ArrayList<>()));
        }
        return result;
    }

    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).trim().replaceAll("\\s+", " ");
    }
}