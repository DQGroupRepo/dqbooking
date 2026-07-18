package com.booking.model;

import com.booking.model.enums.NotificationType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "notifications")
public class Notification extends BaseEntity {

    /*
     * User receiving this notification.
     */
    private String userId;

    /*
     * Notification title.
     * Example:
     * New Booking
     * Payment Received
     */
    private String title;

    /*
     * Display message.
     */
    private String message;

    private NotificationType type;

    /*
     * Booking Id / Review Id / etc.
     */
    private String referenceId;

    private Boolean read = false;

}