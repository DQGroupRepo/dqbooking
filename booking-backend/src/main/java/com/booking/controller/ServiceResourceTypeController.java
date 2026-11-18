package com.booking.controller;

import com.booking.dto.service.UpdateServiceResourceTypesRequest;
import com.booking.model.VendorService;
import com.booking.model.embedded.ServiceResourceType;
import com.booking.model.embedded.ServiceResourceUnit;
import com.booking.repository.VendorServiceRepository;
import com.booking.repository.BookingRepository;
import com.booking.repository.BookingHoldRepository;
import com.booking.model.enums.BookingHoldStatus;
import com.booking.model.enums.BookingStatus;
import com.booking.model.enums.ServiceCategory;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/vendor/services/{serviceId}/resource-types")
@RequiredArgsConstructor
public class ServiceResourceTypeController {
    private final VendorServiceRepository vendorServiceRepository;
    private final BookingRepository bookingRepository;
    private final BookingHoldRepository bookingHoldRepository;

    @GetMapping
    public List<ServiceResourceType> getResourceTypes(@PathVariable String serviceId) {
        VendorService service = findService(serviceId);
        if (service.getCategory() != ServiceCategory.STAY)
            throw new IllegalArgumentException("Resource Types are supported only for STAY services.");
        return service.getResourceTypes() == null ? List.of() : service.getResourceTypes();
    }

    @PutMapping
    public List<ServiceResourceType> updateResourceTypes(
            @PathVariable String serviceId,
            @RequestBody UpdateServiceResourceTypesRequest request) {
        VendorService service = findService(serviceId);
        if (service.getCategory() != ServiceCategory.STAY)
            throw new IllegalArgumentException("Resource Types are supported only for STAY services.");
        List<ServiceResourceType> types = request.getResourceTypes() == null
                ? new ArrayList<>() : request.getResourceTypes();
        Set<String> ids = new HashSet<>();
        Set<String> requestedIds = new HashSet<>();
        for (ServiceResourceType type : types) if (type.getId() != null) requestedIds.add(type.getId());
        Set<String> removedIds = new HashSet<>();
        if (service.getResourceTypes() != null) {
            service.getResourceTypes().stream().map(ServiceResourceType::getId)
                    .filter(Objects::nonNull).filter(id -> !requestedIds.contains(id)).forEach(removedIds::add);
        }
        if (!removedIds.isEmpty()) {
            boolean usedByBooking = bookingRepository.findByServiceId(serviceId).stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                    .anyMatch(b -> removedIds.contains(b.getResourceTypeId())
                            || (b.getResourceAllocations() != null && b.getResourceAllocations().stream()
                            .anyMatch(a -> removedIds.contains(a.getResourceTypeId()))));
            boolean usedByHold = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                            serviceId, BookingHoldStatus.ACTIVE, LocalDateTime.now()).stream()
                    .anyMatch(h -> removedIds.contains(h.getResourceTypeId())
                            || (h.getResourceAllocations() != null && h.getResourceAllocations().stream()
                            .anyMatch(a -> removedIds.contains(a.getResourceTypeId()))));
            if (usedByBooking || usedByHold)
                throw new IllegalArgumentException("A resource type with an existing booking or active hold cannot be removed.");
        }
        for (ServiceResourceType type : types) {
            if (type.getName() == null || type.getName().isBlank())
                throw new IllegalArgumentException("Resource type name is required.");
            if (type.getQuantity() == null || type.getQuantity() < 1 || type.getQuantity() > 100)
                throw new IllegalArgumentException("Resource type quantity must be between 1 and 100.");
            if (type.getId() == null || type.getId().isBlank()) type.setId(UUID.randomUUID().toString());
            if (!ids.add(type.getId())) throw new IllegalArgumentException("Duplicate resource type.");
            List<ServiceResourceUnit> oldUnits = type.getUnits() == null ? new ArrayList<>() : new ArrayList<>(type.getUnits());
            Set<String> retainedUnitIds = new HashSet<>();
            for (int i = 1; i <= type.getQuantity(); i++) retainedUnitIds.add(type.getId() + "-" + i);
            Set<String> deactivatedUnitIds = new HashSet<>();
            oldUnits.stream().map(ServiceResourceUnit::getId).filter(Objects::nonNull)
                    .filter(id -> !retainedUnitIds.contains(id)).forEach(deactivatedUnitIds::add);
            if (!deactivatedUnitIds.isEmpty()) {
                boolean allocatedInBooking = bookingRepository.findByServiceId(serviceId).stream()
                        .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                        .anyMatch(b -> (type.getId().equals(b.getResourceTypeId()) && b.getResourceIds() != null
                                && b.getResourceIds().stream().anyMatch(deactivatedUnitIds::contains))
                                || (b.getResourceAllocations() != null && b.getResourceAllocations().stream()
                                .anyMatch(a -> type.getId().equals(a.getResourceTypeId()) && a.getResourceIds() != null
                                        && a.getResourceIds().stream().anyMatch(deactivatedUnitIds::contains))));
                boolean allocatedInHold = bookingHoldRepository.findByServiceIdAndStatusAndExpiresAtAfter(
                                serviceId, BookingHoldStatus.ACTIVE, LocalDateTime.now()).stream()
                        .anyMatch(h -> (type.getId().equals(h.getResourceTypeId()) && h.getResourceIds() != null
                                && h.getResourceIds().stream().anyMatch(deactivatedUnitIds::contains))
                                || (h.getResourceAllocations() != null && h.getResourceAllocations().stream()
                                .anyMatch(a -> type.getId().equals(a.getResourceTypeId()) && a.getResourceIds() != null
                                        && a.getResourceIds().stream().anyMatch(deactivatedUnitIds::contains))));
                if (allocatedInBooking || allocatedInHold)
                    throw new IllegalArgumentException("Room quantity cannot be reduced while the affected physical rooms are booked or held.");
            }
            List<ServiceResourceUnit> units = new ArrayList<>();
            int unitCount = Math.max(type.getQuantity(), oldUnits.size());
            for (int i = 0; i < unitCount; i++) {
                final int unitNo = i + 1;
                ServiceResourceUnit unit = oldUnits.stream()
                        .filter(u -> u.getId() != null && u.getId().equals(type.getId() + "-" + unitNo))
                        .findFirst().orElseGet(ServiceResourceUnit::new);
                unit.setId(type.getId() + "-" + unitNo);
                if (unit.getName() == null || unit.getName().isBlank())
                    unit.setName(type.getName() + " " + unitNo);
                unit.setActive(unitNo <= type.getQuantity());
                units.add(unit);
            }
            type.setUnits(units);
            if (type.getActive() == null) type.setActive(true);
        }
        service.setResourceTypes(types);
        vendorServiceRepository.save(service);
        return types;
    }

    private VendorService findService(String serviceId) {
        return vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor service not found."));
    }
}
