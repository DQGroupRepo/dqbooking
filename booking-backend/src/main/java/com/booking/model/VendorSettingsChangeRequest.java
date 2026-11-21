package com.booking.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "vendor_settings_change_requests")
public class VendorSettingsChangeRequest {
    @Id
    private String id;
    private String vendorId;
    private LocalDateTime submittedAt = LocalDateTime.now();
    private List<Item> items = new ArrayList<>();

    @Getter @Setter
    public static class Item {
        private String key;
        private String label;
        private String group;
        private String oldValue;
        private String proposedValue;
        private String status = "PENDING";
        private LocalDateTime decidedAt;
        private String rejectionReason;
    }
}
