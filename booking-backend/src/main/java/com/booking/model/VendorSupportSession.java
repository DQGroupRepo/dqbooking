package com.booking.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "vendor_support_sessions")
public class VendorSupportSession {

    @Id
    private String id;

    /*
     * Admin who opened support mode.
     */
    private String adminId;

    /*
     * Vendor being supported.
     */
    private String vendorId;

    /*
     * When support mode started.
     */
    private LocalDateTime startedAt;

    /*
     * When support mode ended.
     */
    private LocalDateTime endedAt;

    /*
     * Whether this support session is currently active.
     */
    private boolean active = true;
}