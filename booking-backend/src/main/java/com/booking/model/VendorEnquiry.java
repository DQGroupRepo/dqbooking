package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "vendor_enquiries")
public class VendorEnquiry extends BaseEntity {

    private String vendorId;
    private String serviceId;

    /*
     * Snapshot: retain the service name even if the vendor renames the service.
     */
    private String serviceName;

    private String customerName;
    private String contactNumber;
    private LocalDate eventDate;
    private String notes;

    /*
     * Optional follow-up date selected by the vendor.
     * A reminder is sent once, at the first scheduler run on/after this date.
     */
    private LocalDate followUpDate;
    private LocalDateTime reminderSentAt;
}
