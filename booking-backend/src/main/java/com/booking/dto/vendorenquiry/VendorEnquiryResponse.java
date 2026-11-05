package com.booking.dto.vendorenquiry;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class VendorEnquiryResponse {

    private String id;
    private String customerName;
    private String contactNumber;
    private String serviceId;
    private String serviceName;
    private LocalDate eventDate;
    private String notes;
    private LocalDate followUpDate;
    private LocalDateTime reminderSentAt;
    private LocalDateTime createdAt;
}
