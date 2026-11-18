package com.booking.service.impl;

import com.booking.dto.vendorenquiry.CreateVendorEnquiryRequest;
import com.booking.dto.vendorenquiry.VendorEnquiryResponse;
import com.booking.exception.VendorServiceNotFoundException;
import com.booking.model.VendorEnquiry;
import com.booking.model.VendorService;
import com.booking.repository.VendorEnquiryRepository;
import com.booking.repository.VendorServiceRepository;
import com.booking.service.VendorAccessService;
import com.booking.service.VendorEnquiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorEnquiryServiceImpl implements VendorEnquiryService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Kolkata");
    private static final LocalTime AFTERNOON_REMINDER_TIME = LocalTime.of(13, 0);

    private final VendorEnquiryRepository enquiryRepository;
    private final VendorServiceRepository vendorServiceRepository;
    private final VendorAccessService vendorAccessService;

    @Override
    public VendorEnquiryResponse createEnquiry(CreateVendorEnquiryRequest request) {
        String vendorId = vendorAccessService.getEffectiveVendorId();

        LocalDateTime now = LocalDateTime.now(BUSINESS_ZONE);
        LocalDate today = now.toLocalDate();

        validateFollowUpDate(request.getFollowUpDate(), today, now.toLocalTime());

        VendorService service = vendorServiceRepository
                .findByIdAndVendorIdAndDeletedFalse(request.getServiceId(), vendorId)
                .orElseThrow(() -> new VendorServiceNotFoundException(
                        "Selected service was not found for this vendor."
                ));

        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Select an active service."
            );
        }

        VendorEnquiry enquiry = new VendorEnquiry();
        enquiry.setVendorId(vendorId);
        enquiry.setServiceId(service.getId());
        enquiry.setServiceName(service.getServiceName());
        enquiry.setCustomerName(request.getCustomerName().trim());
        enquiry.setContactNumber(request.getContactNumber().trim());
        enquiry.setEventDate(request.getEventDate());
        enquiry.setNotes(normalizeNotes(request.getNotes()));
        enquiry.setFollowUpDate(request.getFollowUpDate());

        VendorEnquiry saved = enquiryRepository.save(enquiry);

        log.info(
                "Vendor enquiry created vendorId={} enquiryId={} serviceId={} eventDate={} followUpDate={}",
                vendorId, saved.getId(), saved.getServiceId(),
                saved.getEventDate(), saved.getFollowUpDate()
        );

        return toResponse(saved);
    }

    @Override
    public List<VendorEnquiryResponse> getEnquiriesForDate(LocalDate eventDate) {
        String vendorId = vendorAccessService.getEffectiveVendorId();

        return enquiryRepository
                .findByVendorIdAndEventDateOrderByCreatedTsDesc(vendorId, eventDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateFollowUpDate(
            LocalDate followUpDate,
            LocalDate today,
            LocalTime currentTime
    ) {
        if (followUpDate == null) {
            return;
        }

        if (followUpDate.isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Follow-up date cannot be in the past."
            );
        }

        /*
         * The afternoon reminder run is at 1:00 PM IST.
         * Once that run time has arrived, a same-day reminder is no longer
         * possible; the earliest selectable date is tomorrow.
         */
        if (followUpDate.isEqual(today)
                && !currentTime.isBefore(AFTERNOON_REMINDER_TIME)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Today's follow-up date is no longer available after 1:00 PM. Select tomorrow or a later date."
            );
        }
    }

    private String normalizeNotes(String notes) {
        return notes == null || notes.isBlank() ? null : notes.trim();
    }

    private VendorEnquiryResponse toResponse(VendorEnquiry enquiry) {
        return VendorEnquiryResponse.builder()
                .id(enquiry.getId())
                .customerName(enquiry.getCustomerName())
                .contactNumber(enquiry.getContactNumber())
                .serviceId(enquiry.getServiceId())
                .serviceName(enquiry.getServiceName())
                .eventDate(enquiry.getEventDate())
                .notes(enquiry.getNotes())
                .followUpDate(enquiry.getFollowUpDate())
                .reminderSentAt(enquiry.getReminderSentAt())
                .createdAt(enquiry.getCreatedTs())
                .build();
    }
}
